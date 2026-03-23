import type {
	APIChannel,
	APIGuildChannel,
	ChannelType,
	GuildChannelType,
	Snowflake,
	ThreadAutoArchiveDuration,
} from 'discord-api-types/v10';
import type { Client } from '../client/Client.js';
import { GuildMessageManager } from '../managers/GuildMessageManager.js';
import { GuildTextThreadManager } from '../managers/GuildTextThreadManager.js';
import type { Guild } from './Guild.js';
import { GuildChannel } from './GuildChannel.js';
import { TextBasedChannel } from './interfaces/TextBasedChannel.js';

/**
 * Represents a text-based guild channel on Discord.
 *
 * @extends {GuildChannel}
 * @implements {TextBasedChannel}
 */
export class BaseGuildTextChannel extends GuildChannel {
	public messages: GuildMessageManager;
	public threads: GuildTextThreadManager;
	public nsfw: boolean;
	public declare topic: string | null;
	public lastMessageId: Snowflake | null;
	public lastPinTimestamp: number | null;
	public defaultAutoArchiveDuration: ThreadAutoArchiveDuration | null;
	public defaultThreadRateLimitPerUser: number | null;

	constructor(guild: Guild, data: APIGuildChannel<GuildChannelType>, client: Client) {
		super(guild, data, client, false);

		/**
		 * A manager of the messages sent to this channel
		 *
		 * @type {GuildMessageManager}
		 */
		this.messages = new GuildMessageManager(this);

		/**
		 * A manager of the threads belonging to this channel
		 *
		 * @type {GuildTextThreadManager}
		 */
		this.threads = new GuildTextThreadManager(this);

		/**
		 * If the guild considers this channel NSFW
		 *
		 * @type {boolean}
		 */
		this.nsfw = Boolean((data as any).nsfw);

		this._patch(data);
	}

	_patch(data: Partial<APIGuildChannel<GuildChannelType>>) {
		super._patch(data as APIChannel);

		if ('topic' in data) {
			/**
			 * The topic of the text channel
			 *
			 * @type {?string}
			 */
			this.topic = (data as any).topic;
		}

		if ('nsfw' in data) {
			this.nsfw = Boolean((data as any).nsfw);
		}

		if ('last_message_id' in data) {
			/**
			 * The last message id sent in the channel, if one was sent
			 *
			 * @type {?Snowflake}
			 */
			this.lastMessageId = (data as any).last_message_id;
		}

		if ('last_pin_timestamp' in data) {
			/**
			 * The timestamp when the last pinned message was pinned, if there was one
			 *
			 * @type {?number}
			 */
			this.lastPinTimestamp = (data as any).last_pin_timestamp ? Date.parse((data as any).last_pin_timestamp) : null;
		}

		if ('default_auto_archive_duration' in data) {
			/**
			 * The default auto archive duration for newly created threads in this channel
			 *
			 * @type {?ThreadAutoArchiveDuration}
			 */
			this.defaultAutoArchiveDuration = (data as any).default_auto_archive_duration;
		}

		if ('default_thread_rate_limit_per_user' in data) {
			/**
			 * The initial rate limit per user (slowmode) to set on newly created threads in a channel.
			 *
			 * @type {?number}
			 */
			this.defaultThreadRateLimitPerUser = (data as any).default_thread_rate_limit_per_user;
		} else {
			this.defaultThreadRateLimitPerUser ??= null;
		}

		if ('messages' in data && Array.isArray(data.messages)) {
			for (const message of data.messages) this.messages._add(message as any);
		}
	}

	/**
	 * Sets the default auto archive duration for all newly created threads in this channel.
	 *
	 * @param {ThreadAutoArchiveDuration} defaultAutoArchiveDuration The new default auto archive duration
	 * @param {string} [reason] Reason for changing the channel's default auto archive duration
	 * @returns {Promise<TextChannel>}
	 */
	async setDefaultAutoArchiveDuration(defaultAutoArchiveDuration: ThreadAutoArchiveDuration | null, reason?: string) {
		return (this as any).edit({ defaultAutoArchiveDuration }, reason);
	}

	/**
	 * Sets the type of this channel.
	 * <info>Only conversion between {@link TextChannel} and {@link AnnouncementChannel} is supported.</info>
	 *
	 * @param {ChannelType.GuildText|ChannelType.GuildAnnouncement} type The new channel type
	 * @param {string} [reason] Reason for changing the channel's type
	 * @returns {Promise<GuildChannel>}
	 */
	async setType(type: ChannelType.GuildText | ChannelType.GuildAnnouncement, reason?: string) {
		return (this as any).edit({ type }, reason);
	}

	/**
	 * Sets a new topic for the guild channel.
	 *
	 * @param {?string} topic The new topic for the guild channel
	 * @param {string} [reason] Reason for changing the guild channel's topic
	 * @returns {Promise<GuildChannel>}
	 * @example
	 * // Set a new channel topic
	 * channel.setTopic('needs more rate limiting')
	 *   .then(newChannel => console.log(`Channel's new topic is ${newChannel.topic}`))
	 *   .catch(console.error);
	 */
	async setTopic(topic: string | null, reason?: string) {
		return (this as any).edit({ topic }, reason);
	}

	/**
	 * Creates an invite to this guild channel.
	 *
	 * @param {InviteCreateOptions} [options={}] The options for creating the invite
	 * @returns {Promise<Invite>}
	 * @example
	 * // Create an invite to a channel
	 * channel.createInvite()
	 *   .then(invite => console.log(`Created an invite with a code of ${invite.code}`))
	 *   .catch(console.error);
	 */
	async createInvite(options: any) {
		return this.guild.invites.create(this.id, options);
	}

	/**
	 * Fetches a collection of invites to this guild channel.
	 * Resolves with a collection mapping invites by their codes.
	 *
	 * @param {boolean} [cache=true] Whether or not to cache the fetched invites
	 * @returns {Promise<Collection<string, Invite>>}
	 */
	async fetchInvites(cache = true) {
		return this.guild.invites.fetch({ channelId: this.id, cache });
	}

	// These are here only for documentation purposes - they are implemented by TextBasedChannel

	get lastMessage() {
		return this.lastMessageId ? this.messages.cache.get(this.lastMessageId) : null;
	}

	get lastPinAt() {
		return this.lastPinTimestamp ? new Date(this.lastPinTimestamp) : null;
	}

	send() {}

	sendTyping() {}

	createMessageCollector() {}

	awaitMessages() {}

	createMessageComponentCollector() {}

	awaitMessageComponent() {}

	bulkDelete() {}

	fetchWebhooks() {}

	createWebhook() {}

	setRateLimitPerUser() {}

	setNSFW() {}
}

TextBasedChannel.applyToClass(BaseGuildTextChannel);
