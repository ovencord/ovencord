import { Collection } from '@ovencord/collection';
import type { Snowflake } from 'discord-api-types/v10';
import { ChannelType, Routes } from 'discord-api-types/v10';
import { DiscordjsError, DiscordjsTypeError, ErrorCodes } from '../errors/index.js';
import type { Guild } from '../structures/Guild.js';
import { GuildChannel } from '../structures/GuildChannel.js';
import { PermissionOverwrites } from '../structures/PermissionOverwrites.js';
import { ThreadChannel } from '../structures/ThreadChannel.js';
import { Webhook } from '../structures/Webhook.js';
import { ChannelFlagsBitField } from '../util/ChannelFlagsBitField.js';
import { transformGuildDefaultReaction, transformGuildForumTag } from '../util/Channels.js';
import { ThreadChannelTypes } from '../util/Constants.js';
import { resolveImage } from '../util/DataResolver.js';
import { setPosition } from '../util/Util.js';
import { CachedManager } from './CachedManager.js';
import { GuildTextThreadManager } from './GuildTextThreadManager.js';
import type { BaseFetchOptions } from './UserManager.js';

let cacheWarningEmitted = false;

export type GuildChannelResolvable = GuildChannel | ThreadChannel | Snowflake | string;

/**
 * Manages API methods for GuildChannels and stores their cache.
 *
 * @extends {CachedManager}
 */
export class GuildChannelManager extends CachedManager<
	Snowflake,
	GuildChannel | ThreadChannel,
	GuildChannelResolvable
> {
	public guild: Guild;
	// biome-ignore lint/suspicious/noExplicitAny: iterable hydration
	constructor(guild: Guild, iterable?: Iterable<any>) {
		super(guild.client, GuildChannel, iterable);
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

		/**
		 * The guild this Manager belongs to
		 *
		 * @type {Guild}
		 */
		this.guild = guild;
	}

	/**
	 * The number of channels in this managers cache excluding thread channels
	 * that do not count towards a guild's maximum channels restriction.
	 *
	 * @type {number}
	 * @readonly
	 */
	get channelCountWithoutThreads(): number {
		return this.cache.reduce((acc: number, channel: GuildChannel | ThreadChannel) => {
			if (ThreadChannelTypes.includes(channel.type)) return acc;
			return acc + 1;
		}, 0);
	}

	/**
	 * The cache of this Manager
	 *
	 * @type {Collection<Snowflake, GuildChannel|ThreadChannel>}
	 * @name GuildChannelManager#cache
	 */

	_add(channel: any) {
		const existing = this.cache.get(channel.id);
		if (existing) return existing;
		this.cache.set(channel.id, channel);
		return channel;
	}

	/**
	 * Data that can be resolved to give a Guild Channel object. This can be:
	 * - A GuildChannel object
	 * - A ThreadChannel object
	 * - A Snowflake
	 *
	 * @typedef {GuildChannel|ThreadChannel|Snowflake} GuildChannelResolvable
	 */

	/**
	 * Resolves a GuildChannelResolvable to a Channel object.
	 *
	 * @param {GuildChannelResolvable} channel The GuildChannel resolvable to resolve
	 * @returns {?(GuildChannel|ThreadChannel)}
	 */
	override resolve(channel: GuildChannelResolvable | null | undefined): GuildChannel | ThreadChannel | null {
		if (channel instanceof ThreadChannel) return super.cache.get(channel.id) ?? null;
		return super.resolve(channel);
	}

	override resolveId(channel: GuildChannelResolvable | null | undefined): Snowflake | null {
		if (channel instanceof ThreadChannel) return super.resolveId(channel.id);
		return super.resolveId(channel);
	}

	/**
	 * Adds the target channel to a channel's followers.
	 *
	 * @param {GuildChannelResolvable} channel The channel to follow
	 * @param {GuildChannelResolvable} targetChannel The channel where published announcements will be posted at
	 * @param {string} [reason] Reason for creating the webhook
	 * @returns {Promise<{ channelId: Snowflake; webhookId: Snowflake }>} Returns the data for the followed channel
	 */
	async addFollower(
		channel: GuildChannelResolvable,
		targetChannel: GuildChannelResolvable,
		reason?: string,
	): Promise<{ channelId: Snowflake; webhookId: Snowflake }> {
		const channelId = this.resolveId(channel);
		if (!channelId) {
			throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'channel', 'AnnouncementChannelResolvable');
		}

		const targetChannelId = this.resolveId(targetChannel);
		if (!targetChannelId) {
			throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'targetChannel', 'TextChannelResolvable');
		}

		// biome-ignore lint/suspicious/noExplicitAny: post REST response
		const data = (await this.client.rest.post(Routes.channelFollowers(channelId), {
			body: { webhook_channel_id: targetChannelId },
			reason,
		})) as any;
		return { channelId: data.channel_id, webhookId: data.webhook_id };
	}

	/**
	 * Options used to create a new channel in a guild.
	 *
	 * @typedef {CategoryCreateChannelOptions} GuildChannelCreateOptions
	 * @property {?CategoryChannelResolvable} [parent] Parent of the new channel
	 */

	/**
	 * Creates a new channel in the guild.
	 *
	 * @param {GuildChannelCreateOptions} options Options for creating the new channel
	 * @returns {Promise<GuildChannel>}
	 * @example
	 * // Create a new text channel
	 * guild.channels.create({ name: 'new-general', reason: 'Needed a cool new channel' })
	 *   .then(console.log)
	 *   .catch(console.error);
	 * @example
	 * // Create a new channel with permission overwrites
	 * guild.channels.create({
	 *   name: 'new-general',
	 *   type: ChannelType.GuildVoice,
	 *   permissionOverwrites: [
	 *      {
	 *        id: message.author.id,
	 *        deny: [PermissionFlagsBits.ViewChannel],
	 *     },
	 *   ],
	 * })
	 */
	// biome-ignore lint/suspicious/noExplicitAny: channel create options
	async create({
		name,
		type,
		topic,
		nsfw,
		bitrate,
		userLimit,
		parent,
		permissionOverwrites,
		position,
		rateLimitPerUser,
		rtcRegion,
		videoQualityMode,
		defaultThreadRateLimitPerUser,
		availableTags,
		defaultReactionEmoji,
		defaultAutoArchiveDuration,
		defaultSortOrder,
		defaultForumLayout,
		reason,
	}: any = {}): Promise<GuildChannel> {
		// biome-ignore lint/suspicious/noExplicitAny: post REST payload
		const data = (await this.client.rest.post(Routes.guildChannels(this.guild.id), {
			body: {
				name,
				topic,
				type,
				nsfw,
				bitrate,
				user_limit: userLimit,
				parent_id: parent && this.client.channels.resolveId(parent),
				position,
				// biome-ignore lint/suspicious/noExplicitAny: permission overwrite resolve
				permission_overwrites: permissionOverwrites?.map((overwrite: any) =>
					PermissionOverwrites.resolve(overwrite, this.guild),
				),
				rate_limit_per_user: rateLimitPerUser,
				rtc_region: rtcRegion,
				video_quality_mode: videoQualityMode,
				default_thread_rate_limit_per_user: defaultThreadRateLimitPerUser,
				// biome-ignore lint/suspicious/noExplicitAny: tag transform
				available_tags: availableTags?.map((availableTag: any) => transformGuildForumTag(availableTag)),
				default_reaction_emoji: defaultReactionEmoji && transformGuildDefaultReaction(defaultReactionEmoji),
				default_auto_archive_duration: defaultAutoArchiveDuration,
				default_sort_order: defaultSortOrder,
				default_forum_layout: defaultForumLayout,
			},
			reason,
		})) as any;
		return this.client.actions.ChannelCreate.handle(data).channel;
	}

	/**
	 * @typedef {ChannelWebhookCreateOptions} WebhookCreateOptions
	 * @property {TextChannel|AnnouncementChannel|VoiceChannel|StageChannel|ForumChannel|MediaChannel|Snowflake} channel
	 * The channel to create the webhook for
	 */

	/**
	 * Creates a webhook for the channel.
	 *
	 * @param {WebhookCreateOptions} options Options for creating the webhook
	 * @returns {Promise<Webhook>} Returns the created Webhook
	 * @example
	 * // Create a webhook for the current channel
	 * guild.channels.createWebhook({
	 *   channel: '222197033908436994',
	 *   name: 'Snek',
	 *   avatar: 'https://i.imgur.com/mI8XcpG.jpg',
	 *   reason: 'Needed a cool new Webhook'
	 * })
	 *   .then(console.log)
	 *   .catch(console.error)
	 */
	// biome-ignore lint/suspicious/noExplicitAny: webhook create options
	async createWebhook({ channel, name, avatar, reason }: any): Promise<Webhook> {
		const channelId = this.resolveId(channel);
		if (!channelId) throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'channel', 'GuildChannelResolvable');

		const resolvedAvatar = await resolveImage(avatar);

		// biome-ignore lint/suspicious/noExplicitAny: post REST payload
		const data = (await this.client.rest.post(Routes.channelWebhooks(channelId), {
			body: {
				name,
				avatar: resolvedAvatar,
			},
			reason,
		})) as any;

		return new Webhook(this.client, data);
	}

	/**
	 * Edits the channel.
	 *
	 * @param {GuildChannelResolvable} channel The channel to edit
	 * @param {any} options Options for editing the channel
	 * @returns {Promise<GuildChannel>}
	 */
	// biome-ignore lint/suspicious/noExplicitAny: channel edit options
	async edit(channel: GuildChannelResolvable, options: any): Promise<GuildChannel> {
		const resolvedChannel = this.resolve(channel);
		if (!resolvedChannel) throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'channel', 'GuildChannelResolvable');

		const parentId = options.parent && this.client.channels.resolveId(options.parent);

		if (options.position !== undefined) {
			await this.setPosition(resolvedChannel, options.position, { reason: options.reason });
		}

		// biome-ignore lint/suspicious/noExplicitAny: permission overwrite resolve
		let permission_overwrites = options.permissionOverwrites?.map((overwrite: any) =>
			PermissionOverwrites.resolve(overwrite, this.guild),
		);

		if (options.lockPermissions) {
			if (parentId) {
				const newParent = this.cache.get(parentId);
				if (newParent?.type === ChannelType.GuildCategory) {
					// biome-ignore lint/suspicious/noExplicitAny: permission overwrite resolve
					permission_overwrites = (newParent as any).permissionOverwrites.cache.map((overwrite: any) =>
						PermissionOverwrites.resolve(overwrite, this.guild),
					);
				}
			} else if (resolvedChannel.parent) {
				// biome-ignore lint/suspicious/noExplicitAny: permission overwrite resolve
				permission_overwrites = resolvedChannel.parent.permissionOverwrites.cache.map((overwrite: any) =>
					PermissionOverwrites.resolve(overwrite, this.guild),
				);
			}
		}

		// biome-ignore lint/suspicious/noExplicitAny: patch REST payload
		const newData = (await this.client.rest.patch(Routes.channel(resolvedChannel.id), {
			body: {
				name: options.name,
				type: options.type,
				topic: options.topic,
				nsfw: options.nsfw,
				bitrate: options.bitrate,
				user_limit: options.userLimit,
				rtc_region: options.rtcRegion,
				video_quality_mode: options.videoQualityMode,
				parent_id: parentId,
				lock_permissions: options.lockPermissions,
				rate_limit_per_user: options.rateLimitPerUser,
				default_auto_archive_duration: options.defaultAutoArchiveDuration,
				permission_overwrites,
				// biome-ignore lint/suspicious/noExplicitAny: tag transform
				available_tags: options.availableTags?.map((availableTag: any) => transformGuildForumTag(availableTag)),
				default_reaction_emoji:
					options.defaultReactionEmoji && transformGuildDefaultReaction(options.defaultReactionEmoji),
				default_thread_rate_limit_per_user: options.defaultThreadRateLimitPerUser,
				flags: 'flags' in options ? ChannelFlagsBitField.resolve(options.flags) : undefined,
				default_sort_order: options.defaultSortOrder,
				default_forum_layout: options.defaultForumLayout,
			},
			reason: options.reason,
		})) as any;

		return this.client.actions.ChannelUpdate.handle(newData).updated as GuildChannel;
	}

	/**
	 * Sets a new position for the guild channel.
	 *
	 * @param {GuildChannelResolvable} channel The channel to set the position for
	 * @param {number} position The new position for the guild channel
	 * @param {Object} [options] Options for setting position
	 * @returns {Promise<GuildChannel>}
	 */
	async setPosition(
		channel: GuildChannelResolvable,
		position: number,
		{ relative, reason }: { relative?: boolean; reason?: string } = {},
	): Promise<GuildChannel> {
		const resolvedChannel = this.resolve(channel);
		if (!resolvedChannel) throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'channel', 'GuildChannelResolvable');

		const updatedChannels = await setPosition(
			resolvedChannel,
			position,
			relative,
			// biome-ignore lint/suspicious/noExplicitAny: guild sorted channels
			this.guild._sortedChannels(resolvedChannel as any),
			this.client,
			Routes.guildChannels(this.guild.id),
			reason,
		);

		this.client.actions.GuildChannelsPositionUpdate.handle({
			guild_id: this.guild.id,
			channels: updatedChannels,
		});

		return resolvedChannel as GuildChannel;
	}

	/**
	 * Obtains one or more guild channels from Discord, or the channel cache if they're already available.
	 *
	 * @param {Snowflake} [id] The channel's id
	 * @param {BaseFetchOptions} [options] Additional options for this fetch
	 * @returns {Promise<?GuildChannel|ThreadChannel|Collection<Snowflake, ?GuildChannel>>}
	 */
	async fetch(
		id?: Snowflake,
		{ cache = true, force = false }: BaseFetchOptions = {},
	): Promise<GuildChannel | ThreadChannel | Collection<Snowflake, GuildChannel | ThreadChannel> | null> {
		if (id && !force) {
			const existing = this.cache.get(id);
			if (existing) return existing;
		}

		if (id) {
			// biome-ignore lint/suspicious/noExplicitAny: channel REST response
			const innerData = (await this.client.rest.get(Routes.channel(id))) as any;
			// Since this is the guild manager, throw if on a different guild
			if (this.guild.id !== innerData.guild_id) throw new DiscordjsError(ErrorCodes.GuildChannelUnowned);
			return this.client.channels._add(innerData, this.guild, { cache }) as GuildChannel | ThreadChannel;
		}

		// biome-ignore lint/suspicious/noExplicitAny: guild channels REST response
		const data = (await this.client.rest.get(Routes.guildChannels(this.guild.id))) as any[];
		const channels = new Collection<Snowflake, GuildChannel | ThreadChannel>();
		for (const channel of data)
			channels.set(
				channel.id,
				this.client.channels._add(channel, this.guild, { cache }) as GuildChannel | ThreadChannel,
			);
		return channels;
	}

	/**
	 * Fetches all webhooks for the channel.
	 *
	 * @param {GuildChannelResolvable} channel The channel to fetch webhooks for
	 * @returns {Promise<Collection<Snowflake, Webhook>>}
	 */
	async fetchWebhooks(channel: GuildChannelResolvable): Promise<Collection<Snowflake, Webhook>> {
		const id = this.resolveId(channel);
		if (!id) throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'channel', 'GuildChannelResolvable');
		// biome-ignore lint/suspicious/noExplicitAny: webhooks REST response
		const data = (await this.client.rest.get(Routes.channelWebhooks(id))) as any[];
		// biome-ignore lint/suspicious/noExplicitAny: reducer accumulation
		return data.reduce((hooks: any, hook: any) => hooks.set(hook.id, new Webhook(this.client, hook)), new Collection());
	}

	/**
	 * Batch-updates the guild's channels' positions.
	 *
	 * @param {any[]} channelPositions Channel positions to update
	 * @returns {Promise<Guild>}
	 */
	// biome-ignore lint/suspicious/noExplicitAny: channel position array
	async setPositions(channelPositions: any[]): Promise<Guild> {
		const resolvedChannelPositions = channelPositions.map((channelPosition) => ({
			id: this.client.channels.resolveId(channelPosition.channel),
			position: channelPosition.position,
			lock_permissions: channelPosition.lockPermissions,
			parent_id: channelPosition.parent === undefined ? undefined : this.resolveId(channelPosition.parent),
		}));

		await this.client.rest.patch(Routes.guildChannels(this.guild.id), { body: resolvedChannelPositions });

		return this.client.actions.GuildChannelsPositionUpdate.handle({
			guild_id: this.guild.id,
			channels: resolvedChannelPositions,
		}).guild;
	}

	/**
	 * Obtains all active thread channels in the guild.
	 *
	 * @param {boolean} [cache=true] Whether to cache the fetched data
	 * @returns {Promise<any>}
	 */
	async fetchActiveThreads(cache = true) {
		const data = await this.rawFetchGuildActiveThreads();
		return GuildTextThreadManager._mapThreads(data, this.client, { guild: this.guild, cache });
	}

	/**
	 * `GET /guilds/{guild.id}/threads/active`
	 *
	 * @private
	 * @returns {Promise<any>}
	 */
	async rawFetchGuildActiveThreads() {
		return this.client.rest.get(Routes.guildActiveThreads(this.guild.id));
	}

	/**
	 * Deletes the channel.
	 *
	 * @param {GuildChannelResolvable} channel The channel to delete
	 * @param {string} [reason] Reason for deleting this channel
	 * @returns {Promise<void>}
	 */
	async delete(channel: GuildChannelResolvable, reason?: string): Promise<void> {
		const id = this.resolveId(channel);
		if (!id) throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'channel', 'GuildChannelResolvable');
		await this.client.rest.delete(Routes.channel(id), { reason });
		(this.client.actions.ChannelDelete as any).handle({ id });
	}
}
