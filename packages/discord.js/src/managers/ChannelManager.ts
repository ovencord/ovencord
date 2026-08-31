import { isFileBodyEncodable, isJSONEncodable, lazy } from '@ovencord/util';
import type { Snowflake } from 'discord-api-types/v10';
import { Routes } from 'discord-api-types/v10';
import type { Client } from '../client/Client.js';
import { BaseChannel } from '../structures/BaseChannel.js';
import type { Message } from '../structures/Message.js';
import { MessagePayload } from '../structures/MessagePayload.js';
import { createChannel } from '../util/Channels.js';
import { ThreadChannelTypes } from '../util/Constants.js';
import { Events } from '../util/Events.js';
import { CachedManager } from './CachedManager.js';
import type { BaseFetchOptions } from './UserManager.js';

const getMessage = lazy(() => require('../structures/Message.js').Message);

let cacheWarningEmitted = false;

export type ChannelResolvable = BaseChannel | Snowflake | string;

export interface FetchChannelOptions extends BaseFetchOptions {
	allowUnknownGuild?: boolean;
}

/**
 * A manager of channels belonging to a client
 *
 * @extends {CachedManager}
 */
export class ChannelManager extends CachedManager<Snowflake, BaseChannel, ChannelResolvable> {
	// biome-ignore lint/suspicious/noExplicitAny: iterable hydration
	constructor(client: Client, iterable?: Iterable<any>) {
		super(client, BaseChannel, iterable);
		const defaultCaching =
			this._cache.constructor.name === 'Collection' ||
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

	// biome-ignore lint/suspicious/noExplicitAny: internal cache hydration
	override _add(data: any, guild?: any, { cache = true, allowUnknownGuild = false }: any = {}) {
		const existing = this.cache.get(data.id);
		if (existing) {
			if (cache) existing._patch(data);
			guild?.channels?._add(existing);
			if (ThreadChannelTypes.includes(existing.type)) {
				existing.parent?.threads?._add(existing);
			}

			return existing;
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
		const channel = this.cache.get(id);
		// biome-ignore lint/suspicious/noExplicitAny: channel guild reference
		(channel as any)?.guild?.channels.cache.delete(id);

		// biome-ignore lint/suspicious/noExplicitAny: channel guild reference
		for (const [code, invite] of (channel as any)?.guild?.invites.cache ?? []) {
			// biome-ignore lint/suspicious/noExplicitAny: channel guild reference
			if (invite.channelId === id) (channel as any).guild.invites.cache.delete(code);
		}

		// biome-ignore lint/suspicious/noExplicitAny: channel parent threads reference
		(channel as any)?.parent?.threads?.cache.delete(id);
		this.cache.delete(id);

		// biome-ignore lint/suspicious/noExplicitAny: channel threads reference
		if ((channel as any)?.threads) {
			// biome-ignore lint/suspicious/noExplicitAny: channel threads reference
			for (const threadId of (channel as any).threads.cache.keys()) {
				this.cache.delete(threadId);
				// biome-ignore lint/suspicious/noExplicitAny: channel guild reference
				(channel as any).guild?.channels.cache.delete(threadId);
			}
		}
	}

	/**
	 * Obtains a channel from Discord, or the channel cache if it's already available.
	 *
	 * @param {Snowflake} id The channel's id
	 * @param {FetchChannelOptions} [options] Additional options for this fetch
	 * @returns {Promise<?BaseChannel>}
	 */
	async fetch(
		id: Snowflake,
		{ allowUnknownGuild = false, cache = true, force = false }: FetchChannelOptions = {},
	): Promise<BaseChannel | null> {
		if (!force) {
			const existing = this.cache.get(id);
			// biome-ignore lint/suspicious/noExplicitAny: partial check
			if (existing && !(existing as any).partial) return existing;
		}

		// biome-ignore lint/suspicious/noExplicitAny: channel REST payload
		const data = (await this.client.rest.get(Routes.channel(id))) as any;
		return this._add(data, null, { cache, allowUnknownGuild });
	}

	/**
	 * Creates a message in a channel.
	 *
	 * @param {ChannelResolvable} channel The channel to send the message to
	 * @param {string|MessagePayload|any} options The options to provide
	 * @returns {Promise<Message>}
	 */
	// biome-ignore lint/suspicious/noExplicitAny: message creation options
	async createMessage(channel: ChannelResolvable, options: any): Promise<Message> {
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
		if (!resolvedChannelId) throw new Error('Invalid channel resolvable');
		const resolvedChannel = this.resolve(channel);
		// biome-ignore lint/suspicious/noExplicitAny: channel message post
		const data = (await this.client.rest.post(Routes.channelMessages(resolvedChannelId), payload)) as any;

		// biome-ignore lint/suspicious/noExplicitAny: channel messages manager reference
		return (resolvedChannel as any)?.messages._add(data) ?? new (getMessage())(this.client, data);
	}
}
