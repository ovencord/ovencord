import type { Snowflake } from 'discord-api-types/v10';
import { ChannelType, Routes } from 'discord-api-types/v10';
import type { Client } from '../client/Client.js';
import { DiscordjsError, ErrorCodes } from '../errors/index.js';
import type { DMChannel } from '../structures/DMChannel.js';
import { GuildMember } from '../structures/GuildMember.js';
import { Message } from '../structures/Message.js';
import type { MessagePayload } from '../structures/MessagePayload.js';
import { ThreadMember } from '../structures/ThreadMember.js';
import { User } from '../structures/User.js';
import { CachedManager } from './CachedManager.js';

export type UserResolvable = User | Snowflake | Message | GuildMember | ThreadMember | string;

export interface BaseFetchOptions {
	cache?: boolean;
	force?: boolean;
}

/**
 * Manages API methods for users and stores their cache.
 *
 * @extends {CachedManager}
 */
export class UserManager extends CachedManager<Snowflake, User, UserResolvable> {
	// biome-ignore lint/suspicious/noExplicitAny: iterable hydration
	constructor(client: Client, iterable?: Iterable<any>) {
		super(client, User, iterable);
	}

	/**
	 * The DM between the client's user and a user
	 *
	 * @param {Snowflake} userId The user id
	 * @returns {?DMChannel}
	 * @private
	 */
	dmChannel(userId: Snowflake): DMChannel | null {
		return (
			(this.client.channels.cache.find(
				// biome-ignore lint/suspicious/noExplicitAny: channel type check
				(channel: any) => channel.type === ChannelType.DM && channel.recipientId === userId,
			) as DMChannel | undefined) ?? null
		);
	}

	/**
	 * Creates a {@link DMChannel} between the client and a user.
	 *
	 * @param {UserResolvable} user The UserResolvable to identify
	 * @param {BaseFetchOptions} [options] Additional options for this fetch
	 * @returns {Promise<DMChannel>}
	 */
	async createDM(user: UserResolvable, { cache = true, force = false }: BaseFetchOptions = {}): Promise<DMChannel> {
		const id = this.resolveId(user);
		if (!id) throw new DiscordjsError(ErrorCodes.InvalidType, 'user', 'UserResolvable');

		if (!force) {
			const dmChannel = this.dmChannel(id);
			// biome-ignore lint/suspicious/noExplicitAny: partial check
			if (dmChannel && !(dmChannel as any).partial) return dmChannel;
		}

		// biome-ignore lint/suspicious/noExplicitAny: post REST body
		const data = (await this.client.rest.post(Routes.userChannels(), { body: { recipient_id: id } })) as any;
		return this.client.channels._add(data, null, { cache }) as DMChannel;
	}

	/**
	 * Deletes a {@link DMChannel} (if one exists) between the client and a user. Resolves with the channel if successful.
	 *
	 * @param {UserResolvable} user The UserResolvable to identify
	 * @returns {Promise<DMChannel>}
	 */
	async deleteDM(user: UserResolvable): Promise<DMChannel> {
		const id = this.resolveId(user);
		if (!id) throw new DiscordjsError(ErrorCodes.InvalidType, 'user', 'UserResolvable');
		const dmChannel = this.dmChannel(id);
		if (!dmChannel) throw new DiscordjsError(ErrorCodes.UserNoDMChannel);
		await this.client.rest.delete(Routes.channel(dmChannel.id));
		this.client.channels._remove(dmChannel.id);
		return dmChannel;
	}

	/**
	 * Obtains a user from Discord, or the user cache if it's already available.
	 *
	 * @param {UserResolvable} user The user to fetch
	 * @param {BaseFetchOptions} [options] Additional options for this fetch
	 * @returns {Promise<User>}
	 */
	async fetch(user: UserResolvable, { cache = true, force = false }: BaseFetchOptions = {}): Promise<User> {
		const id = this.resolveId(user);
		if (!id) throw new DiscordjsError(ErrorCodes.InvalidType, 'user', 'UserResolvable');
		if (!force) {
			const existing = this.cache.get(id);
			// biome-ignore lint/suspicious/noExplicitAny: partial check
			if (existing && !(existing as any).partial) return existing;
		}

		// biome-ignore lint/suspicious/noExplicitAny: user REST response
		const data = (await this.client.rest.get(Routes.user(id))) as any;
		return this._add(data, cache);
	}

	/**
	 * Sends a message to a user.
	 *
	 * @param {UserResolvable} user The UserResolvable to identify
	 * @param {string|MessagePayload|any} options The options to provide
	 * @returns {Promise<Message>}
	 */
	// biome-ignore lint/suspicious/noExplicitAny: send message payload
	async send(user: UserResolvable, options: string | MessagePayload | any): Promise<Message> {
		// biome-ignore lint/suspicious/noExplicitAny: send message payload
		return (await this.createDM(user)).send(options as any) as unknown as Message;
	}

	/**
	 * Resolves a {@link UserResolvable} to a {@link User} object.
	 *
	 * @param {UserResolvable} user The UserResolvable to identify
	 * @returns {?User}
	 */
	override resolve(user: UserResolvable | null | undefined): User | null {
		if (user instanceof GuildMember || user instanceof ThreadMember) return user.user;
		if (user instanceof Message) return user.author;
		return super.resolve(user);
	}

	/**
	 * Resolves a {@link UserResolvable} to a {@link User} id.
	 *
	 * @param {UserResolvable} user The UserResolvable to identify
	 * @returns {?Snowflake}
	 */
	override resolveId(user: UserResolvable | null | undefined): Snowflake | null {
		if (user instanceof ThreadMember) return user.id;
		if (user instanceof GuildMember) return user.user.id;
		if (user instanceof Message) return user.author.id;
		return super.resolveId(user);
	}
}
