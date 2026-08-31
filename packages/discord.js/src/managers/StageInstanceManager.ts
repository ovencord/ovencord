import type { Snowflake, StageInstancePrivacyLevel } from 'discord-api-types/v10';
import { Routes } from 'discord-api-types/v10';
import { DiscordjsError, DiscordjsTypeError, ErrorCodes } from '../errors/index.js';
import type { Guild } from '../structures/Guild.js';
import type { StageChannel } from '../structures/StageChannel.js';
import { StageInstance } from '../structures/StageInstance.js';
import { CachedManager } from './CachedManager.js';
import type { BaseFetchOptions } from './UserManager.js';

export type StageChannelResolvable = StageChannel | Snowflake | string;
export type StageInstanceResolvable = StageInstance | Snowflake | string;

export interface StageInstanceCreateOptions {
	topic: string;
	privacyLevel?: StageInstancePrivacyLevel;
	sendStartNotification?: boolean;
	// biome-ignore lint/suspicious/noExplicitAny: guild scheduled event resolvable
	guildScheduledEvent?: any;
}

export interface StageInstanceEditOptions {
	topic?: string;
	privacyLevel?: StageInstancePrivacyLevel;
}

/**
 * Manages API methods for {@link StageInstance} objects and holds their cache.
 *
 * @extends {CachedManager}
 */
export class StageInstanceManager extends CachedManager<Snowflake, StageInstance, StageInstanceResolvable> {
	public guild: Guild;
	// biome-ignore lint/suspicious/noExplicitAny: iterable hydration
	constructor(guild: Guild, iterable?: Iterable<any>) {
		super(guild.client, StageInstance, iterable);

		/**
		 * The guild this manager belongs to
		 *
		 * @type {Guild}
		 */
		this.guild = guild;
	}

	/**
	 * Creates a new stage instance.
	 *
	 * @param {StageChannelResolvable} channel The stage channel to associate the created stage instance to
	 * @param {StageInstanceCreateOptions} options The options to create the stage instance
	 * @returns {Promise<StageInstance>}
	 */
	async create(channel: StageChannelResolvable, options: StageInstanceCreateOptions): Promise<StageInstance> {
		const channelId = this.guild.channels.resolveId(channel as any);
		if (!channelId) throw new DiscordjsError(ErrorCodes.StageChannelResolve);
		if (typeof options !== 'object') throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'options', 'object', true);
		const { guildScheduledEvent, topic, privacyLevel, sendStartNotification } = options;

		const guildScheduledEventId = guildScheduledEvent && this.resolveId(guildScheduledEvent);

		// biome-ignore lint/suspicious/noExplicitAny: post REST payload
		const data = (await this.client.rest.post(Routes.stageInstances(), {
			body: {
				channel_id: channelId,
				topic,
				privacy_level: privacyLevel,
				send_start_notification: sendStartNotification,
				guild_scheduled_event_id: guildScheduledEventId,
			},
		})) as any;

		return this._add(data);
	}

	/**
	 * Fetches the stage instance associated with a stage channel, if it exists.
	 *
	 * @param {StageChannelResolvable} channel The stage channel whose associated stage instance is to be fetched
	 * @param {BaseFetchOptions} [options] Additional options for this fetch
	 * @returns {Promise<StageInstance>}
	 */
	async fetch(
		channel: StageChannelResolvable,
		{ cache = true, force = false }: BaseFetchOptions = {},
	): Promise<StageInstance> {
		const channelId = this.guild.channels.resolveId(channel as any);
		if (!channelId) throw new DiscordjsError(ErrorCodes.StageChannelResolve);

		if (!force) {
			const existing = this.cache.find((stageInstance) => stageInstance.channelId === channelId);
			if (existing) return existing;
		}

		// biome-ignore lint/suspicious/noExplicitAny: stage instance REST response
		const data = (await this.client.rest.get(Routes.stageInstance(channelId))) as any;
		return this._add(data, cache);
	}

	/**
	 * Edits an existing stage instance.
	 *
	 * @param {StageChannelResolvable} channel The stage channel whose associated stage instance is to be edited
	 * @param {StageInstanceEditOptions} options The options to edit the stage instance
	 * @returns {Promise<StageInstance>}
	 */
	async edit(channel: StageChannelResolvable, options: StageInstanceEditOptions): Promise<StageInstance> {
		if (typeof options !== 'object') throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'options', 'object', true);
		const channelId = this.guild.channels.resolveId(channel as any);
		if (!channelId) throw new DiscordjsError(ErrorCodes.StageChannelResolve);

		const { topic, privacyLevel } = options;

		// biome-ignore lint/suspicious/noExplicitAny: patch REST payload
		const data = (await this.client.rest.patch(Routes.stageInstance(channelId), {
			body: {
				topic,
				privacy_level: privacyLevel,
			},
		})) as any;

		if (this.cache.has(data.id)) {
			// biome-ignore lint/suspicious/noExplicitAny: clone method invocation
			const clone = (this.cache.get(data.id) as any)._clone();
			clone._patch(data);
			return clone;
		}

		return this._add(data);
	}

	/**
	 * Deletes an existing stage instance.
	 *
	 * @param {StageChannelResolvable} channel The stage channel whose associated stage instance is to be deleted
	 * @returns {Promise<void>}
	 */
	async delete(channel: StageChannelResolvable): Promise<void> {
		const channelId = this.guild.channels.resolveId(channel as any);
		if (!channelId) throw new DiscordjsError(ErrorCodes.StageChannelResolve);

		await this.client.rest.delete(Routes.stageInstance(channelId));
	}
}
