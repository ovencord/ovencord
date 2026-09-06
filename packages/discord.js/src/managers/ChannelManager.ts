import { isFileBodyEncodable, isJSONEncodable, lazy } from '@ovencord/util';
import { type APIChannel, Routes, type Snowflake } from 'discord-api-types/v10';
import type { Client } from '../client/Client.js';
import { BaseChannel } from '../structures/BaseChannel.js';
import type { Guild } from '../structures/Guild.js';
import type { InviteGuild } from '../structures/InviteGuild.js';
import { MessagePayload } from '../structures/MessagePayload.js';
import { createChannel } from '../util/Channels.js';
import { ThreadChannelTypes } from '../util/Constants.js';
import { Events } from '../util/Events.js';
import { CachedManager } from './CachedManager.js';

const getMessage = lazy(() => require('../structures/Message.js').Message);

let cacheWarningEmitted = false;

/**
 * Data that can be resolved to give a Channel object. This can be:
 * - A Channel object
 * - A Snowflake
 */
export type ChannelResolvable = BaseChannel | Snowflake;

/**
 * Options for fetching a channel from Discord
 */
export interface FetchChannelOptions {
	/** Whether to include approximate member counts */
	allowUnknownGuild?: boolean;
	/** Whether to cache the fetched channel */
	cache?: boolean;
	/** Whether to skip the cache and fetch from the API */
	force?: boolean;
}

/**
 * A manager of channels belonging to a client
 *
 * @extends {CachedManager}
 */
export class ChannelManager extends CachedManager {
	constructor(client: Client, iterable?: Iterable<APIChannel>) {
		super(client, BaseChannel, iterable);
		const defaultCaching =
			(this._cache as any).constructor.name === 'Collection' ||
			(this._cache as any).maxSize === undefined ||
			(this._cache as any).maxSize === Infinity;
		if (!cacheWarningEmitted && !defaultCaching) {
			cacheWarningEmitted = true;
			process.emitWarning(
				`Overriding the cache handling for ${this.constructor.name} is unsupported and breaks functionality.`,
				'UnsupportedCacheOverwriteWarning',
			);
		}
	}

	/**
	 * The cache of Channels
	 *
	 * @type {Collection<Snowflake, BaseChannel>}
	 * @name ChannelManager#cache
	 */

	_add(
		data: APIChannel & { id: Snowflake },
		guild?: Guild | InviteGuild,
		{ cache = true, allowUnknownGuild = false }: { cache?: boolean; allowUnknownGuild?: boolean } = {},
	) {
		const existing = this.cache.get(data.id);
		if (existing) {
			if (cache) (existing as any)._patch(data);
			if (guild) (guild as any).channels?._add(existing);
			if (ThreadChannelTypes.includes((existing as any).type)) {
				(existing as any).parent?.threads?._add(existing);
			}

			return existing as BaseChannel;
		}

		const channel = createChannel(this.client, data, guild, { allowUnknownGuild });

		if (!channel) {
			this.client.emit(Events.Debug, `Failed to find guild, or unknown type for channel ${data.id} ${data.type}`);
			return null;
		}

		if (cache && !allowUnknownGuild) this.cache.set(channel.id, channel);

		return channel;
	}

	_remove(id: Snowflake) {
		const channel = this.cache.get(id) as any;
		channel?.guild?.channels.cache.delete(id);

		for (const [code, invite] of (channel?.guild?.invites.cache as any) ?? []) {
			if (invite.channelId === id) channel.guild.invites.cache.delete(code);
		}

		channel?.parent?.threads?.cache.delete(id);
		this.cache.delete(id);

		if (channel?.threads) {
			for (const threadId of channel.threads.cache.keys()) {
				this.cache.delete(threadId);
				channel.guild?.channels.cache.delete(threadId);
			}
		}
	}

	/**
	 * Resolves a ChannelResolvable to a Channel object.
	 *
	 * @param {ChannelResolvable} channel The channel resolvable to resolve
	 * @returns {?BaseChannel}
	 */
	override resolve(channel: ChannelResolvable): BaseChannel | null {
		return super.resolve(channel);
	}

	/**
	 * Resolves a ChannelResolvable to a channel id string.
	 *
	 * @param {ChannelResolvable} channel The channel resolvable to resolve
	 * @returns {?Snowflake}
	 */
	override resolveId(channel: ChannelResolvable): Snowflake | null {
		return super.resolveId(channel);
	}

	/**
	 * Obtains a channel from Discord, or the channel cache if it's already available.
	 *
	 * @param {Snowflake} id The channel's id
	 * @param {FetchChannelOptions} [options] Additional options for this fetch
	 * @returns {Promise<?BaseChannel>}
	 * @example
	 * // Fetch a channel by its id
	 * client.channels.fetch('222109930545610754')
	 *   .then(channel => console.log(channel.name))
	 *   .catch(console.error);
	 */
	async fetch(id: Snowflake, { allowUnknownGuild = false, cache = true, force = false }: FetchChannelOptions = {}) {
		if (!force) {
			const existing = this.cache.get(id);
			if (existing && !(existing as any).partial) return existing as BaseChannel;
		}

		const data = (await this.client.rest.get(Routes.channel(id))) as APIChannel & { id: Snowflake };
		return this._add(data, undefined, { cache, allowUnknownGuild });
	}

	/**
	 * Creates a message in a channel.
	 *
	 * @param {ChannelResolvable} channel The channel to send the message to
	 * @param {string|MessagePayload|Record<string, unknown>} options The options to provide
	 * @returns {Promise<Message>}
	 */
	async createMessage(channel: ChannelResolvable, options: string | MessagePayload | Record<string, unknown>) {
		let payload: any;

		if (options instanceof MessagePayload) {
			payload = await options.resolveBody().resolveFiles();
		} else if (isFileBodyEncodable(options)) {
			payload = options.toFileBody();
		} else if (isJSONEncodable(options)) {
			payload = { body: options.toJSON() };
		} else {
			payload = await MessagePayload.create(this, options).resolveBody().resolveFiles();
		}

		const resolvedChannelId = this.resolveId(channel);
		const resolvedChannel = this.resolve(channel) as any;
		if (!resolvedChannelId) throw new Error('Invalid channel');

		const data = await this.client.rest.post(Routes.channelMessages(resolvedChannelId), payload);

		return resolvedChannel?.messages?._add(data) ?? new (getMessage())(this.client, data);
	}
}
