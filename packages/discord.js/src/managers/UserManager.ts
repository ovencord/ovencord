import { type APIUser, ChannelType, Routes, type Snowflake } from 'discord-api-types/v10';
import type { Client } from '../client/Client.js';
import { DiscordjsError, ErrorCodes } from '../errors/index.js';
import { GuildMember } from '../structures/GuildMember.js';
import { Message } from '../structures/Message.js';
import { ThreadMember } from '../structures/ThreadMember.js';
import { User } from '../structures/User.js';
import { CachedManager } from './CachedManager.js';

export interface BaseFetchOptions {
	cache?: boolean;
	force?: boolean;
}

/**
 * Data that resolves to give a User object. This can be:
 * - A User object
 * - A Snowflake
 * - A Message object (resolves to the message author)
 * - A GuildMember object
 * - A ThreadMember object
 */
export type UserResolvable = User | Snowflake | Message | GuildMember | ThreadMember;

/**
 * Manages API methods for users and stores their cache.
 *
 * @extends {CachedManager}
 */
export class UserManager extends CachedManager<Snowflake, User, UserResolvable> {
	constructor(client: Client, iterable?: Iterable<APIUser>) {
		super(client, User, iterable);
	}

	/**
	 * The cache of this manager
	 *
	 * @type {Collection<Snowflake, User>}
	 * @name UserManager#cache
	 */

	/**
	 * The DM between the client's user and a user
	 *
	 * @param {Snowflake} userId The user id
	 * @returns {?DMChannel}
	 * @private
	 */
	dmChannel(userId: Snowflake) {
		return (
			(this.client.channels.cache as any).find(
				(channel: any) => channel.type === ChannelType.DM && channel.recipientId === userId,
			) ?? null
		);
	}

	/**
	 * Creates a {@link DMChannel} between the client and a user.
	 *
	 * @param {UserResolvable} user The UserResolvable to identify
	 * @param {Object} [options] Additional options for this fetch
	 * @returns {Promise<DMChannel>}
	 */
	async createDM(user: UserResolvable | any, { cache = true, force = false } = {}) {
		const id = this.resolveId(user);
		if (!id) throw new Error('Invalid user');

		if (!force) {
			const dmChannel = this.dmChannel(id) as any;
			if (dmChannel && !dmChannel.partial) return dmChannel;
		}

		const data = (await this.client.rest.post(Routes.userChannels(), { body: { recipient_id: id } })) as any;
		return (this.client.channels as any)._add(data, null, { cache });
	}

	/**
	 * Deletes a {@link DMChannel} (if one exists) between the client and a user. Resolves with the channel if successful.
	 *
	 * @param {UserResolvable} user The UserResolvable to identify
	 * @returns {Promise<DMChannel>}
	 */
	async deleteDM(user: UserResolvable | any) {
		const id = this.resolveId(user);
		if (!id) throw new Error('Invalid user');
		const dmChannel = this.dmChannel(id) as any;
		if (!dmChannel) throw new DiscordjsError(ErrorCodes.UserNoDMChannel);
		await this.client.rest.delete(Routes.channel(dmChannel.id));
		(this.client.channels as any)._remove(dmChannel.id);
		return dmChannel;
	}

	/**
	 * Obtains a user from Discord, or the user cache if it's already available.
	 *
	 * @param {UserResolvable} user The user to fetch
	 * @param {Object} [options] Additional options for this fetch
	 * @returns {Promise<User>}
	 */
	async fetch(user: UserResolvable | any, { cache = true, force = false } = {}) {
		const id = this.resolveId(user);
		if (!id) throw new Error('Invalid user');
		if (!force) {
			const existing = this.cache.get(id);
			if (existing && !(existing as any).partial) return existing as User;
		}

		const data = (await this.client.rest.get(Routes.user(id))) as APIUser;
		return this._add(data, cache) as User;
	}

	/**
	 * Sends a message to a user.
	 *
	 * @param {UserResolvable} user The UserResolvable to identify
	 * @param {string|MessagePayload|Record<string, unknown>} options The options to provide
	 * @returns {Promise<Message>}
	 */
	async send(user: UserResolvable | any, options: any) {
		return (await this.createDM(user)).send(options);
	}

	/**
	 * Resolves a {@link UserResolvable} to a {@link User} object.
	 *
	 * @param {UserResolvable} user The UserResolvable to identify
	 * @returns {?User}
	 */
	override resolve(user: UserResolvable | any): User | null {
		if (user instanceof GuildMember || user instanceof ThreadMember) return (user as any).user;
		if (user instanceof Message) return user.author;
		return super.resolve(user);
	}

	/**
	 * Resolves a {@link UserResolvable} to a {@link User} id.
	 *
	 * @param {UserResolvable} user The UserResolvable to identify
	 * @returns {?Snowflake}
	 */
	override resolveId(user: UserResolvable | any): Snowflake | null {
		if (user instanceof ThreadMember) return (user as any).id;
		if (user instanceof GuildMember) return (user as any).user.id;
		if (user instanceof Message) return user.author.id;
		return super.resolveId(user);
	}
}
