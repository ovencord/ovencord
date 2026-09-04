import { makeURLSearchParams } from '@ovencord/rest';
import { DiscordSnowflake, lazy } from '@ovencord/util';
import {
	type APIInteractionResponseCallbackData,
	type APIWebhook,
	type MessageFlags,
	Routes,
	type Snowflake,
	WebhookType,
} from 'discord-api-types/v10';
import type { Client } from '../client/Client.js';
import { DiscordjsError, ErrorCodes } from '../errors/index.js';
import { resolveImage } from '../util/DataResolver.js';
import type { AnnouncementChannel } from './AnnouncementChannel.js';
import type { Guild } from './Guild.js';
import type { Message } from './Message.js';
import { MessagePayload } from './MessagePayload.js';
import type { User } from './User.js';

export type BufferResolvable = string | Buffer | Uint8Array | ArrayBuffer | Blob;

export type MessageResolvable = Message | Snowflake;

export interface WebhookMessageCreateOptions extends APIInteractionResponseCallbackData {
	username?: string;
	avatarURL?: string;
	threadId?: Snowflake;
	threadName?: string;
	appliedTags?: Snowflake[];
	withComponents?: boolean;
	files?: any[]; // Simplified for now, MessagePayload handles this
}

export interface WebhookMessageEditOptions extends APIInteractionResponseCallbackData {
	threadId?: Snowflake;
	withComponents?: boolean;
	files?: any[];
}

export interface WebhookEditOptions {
	name?: string;
	avatar?: BufferResolvable | null;
	channel?: Snowflake | { id: Snowflake };
	reason?: string;
}

export interface WebhookFetchMessageOptions {
	cache?: boolean;
	threadId?: Snowflake;
}

const getMessage = lazy(() => require('./Message.js').Message);

/**
 * Represents a webhook.
 */
export class Webhook {
	public name: string | null = null;
	public id: Snowflake;
	public type: WebhookType;
	public guildId: Snowflake | null;
	public channelId: Snowflake;
	public owner: User | null;
	public applicationId: Snowflake | null;
	public sourceGuild: Guild | any | null;
	public sourceChannel: AnnouncementChannel | any | null;
	public avatar: string | null;
	public readonly client!: Client;
	public token: string | null;
	constructor(client: Client, data: APIWebhook) {
		/**
		 * The client that instantiated the webhook
		 *
		 * @name Webhook#client
		 * @type {Client}
		 * @readonly
		 */
		Object.defineProperty(this, 'client', { value: client });
		this._patch(data);
	}

	_patch(data: APIWebhook) {
		if ('name' in data) {
			this.name = data.name;
		}

		Object.defineProperty(this, 'token', {
			value: data.token ?? null,
			writable: true,
			configurable: true,
		});

		if ('avatar' in data) {
			this.avatar = data.avatar;
		}

		this.id = data.id;

		if ('type' in data) {
			this.type = data.type;
		}

		if ('guild_id' in data) {
			this.guildId = data.guild_id as Snowflake;
		} else {
			this.guildId ??= null;
		}

		if ('channel_id' in data) {
			this.channelId = data.channel_id as Snowflake;
		}

		if (data.user) {
			this.owner = this.client.users._add(data.user);
		} else {
			this.owner ??= null;
		}

		if ('application_id' in data) {
			this.applicationId = data.application_id as Snowflake;
		} else {
			this.applicationId ??= null;
		}

		if ('source_guild' in data && data.source_guild) {
			const sourceGuild = data.source_guild;
			this.sourceGuild = this.client.guilds.cache.get(sourceGuild.id as Snowflake) ?? sourceGuild;
		} else {
			this.sourceGuild ??= null;
		}

		if ('source_channel' in data && data.source_channel) {
			const sourceChannel = data.source_channel;
			this.sourceChannel =
				(this.client.channels.cache.get(sourceChannel.id as Snowflake) as AnnouncementChannel) ?? sourceChannel;
		} else {
			this.sourceChannel ??= null;
		}
	}

	/**
	 * Options that can be passed into send.
	 *
	 * @typedef {BaseMessageOptionsWithPoll} WebhookMessageCreateOptions
	 * @property {boolean} [tts=false] Whether the message should be spoken aloud
	 * @property {MessageFlags} [flags] Which flags to set for the message.
	 * <info>Only {@link MessageFlags.SuppressEmbeds} and {@link MessageFlags.IsVoiceMessage} can be set.</info>
	 * @property {string} [username=this.name] Username override for the message
	 * @property {string} [avatarURL] Avatar URL override for the message
	 * @property {Snowflake} [threadId] The id of the thread in the channel to send to.
	 * <info>For interaction webhooks, this property is ignored</info>
	 * @property {string} [threadName] Name of the thread to create (only available if the webhook is in a forum channel)
	 * @property {Snowflake[]} [appliedTags]
	 * The tags to apply to the created thread (only available if the webhook is in a forum channel)
	 * @property {boolean} [withComponents] Whether to allow sending non-interactive components in the message.
	 * <info>For application-owned webhooks, this property is ignored</info>
	 */

	/**
	 * Options that can be passed into editMessage.
	 *
	 * @typedef {MessageEditOptions} WebhookMessageEditOptions
	 * @property {Snowflake} [threadId] The id of the thread this message belongs to
	 * <info>For interaction webhooks, this property is ignored</info>
	 * @property {boolean} [withComponents] Whether to allow sending non-interactive components in the message.
	 * <info>For application-owned webhooks, this property is ignored</info>
	 */

	/**
	 * The channel the webhook belongs to
	 *
	 * @type {?(TextChannel|VoiceChannel|StageChannel|AnnouncementChannel|ForumChannel|MediaChannel)}
	 * @readonly
	 */
	get channel() {
		return this.client.channels.resolve(this.channelId);
	}

	async send(options: string | MessagePayload | WebhookMessageCreateOptions): Promise<Message> {
		if (!this.token) throw new DiscordjsError(ErrorCodes.WebhookTokenUnavailable);

		let messagePayload: MessagePayload;

		if (options instanceof MessagePayload) {
			messagePayload = options.resolveBody();
		} else {
			messagePayload = MessagePayload.create(this, options).resolveBody();
		}

		const query = makeURLSearchParams({
			wait: true,
			thread_id: (messagePayload.options as any).threadId as Snowflake | undefined,
			with_components: (messagePayload.options as any).withComponents as boolean | undefined,
		});

		const { body, files } = await messagePayload.resolveFiles();
		const data = (await this.client.rest.post(Routes.webhook(this.id, this.token), {
			body,
			files,
			query,
			auth: false,
		})) as any;

		return (
			this.client.channels.cache.get(data.channel_id as Snowflake)?.messages._add(data, false) ??
			new (getMessage())(this.client, data)
		);
	}

	/**
	 * Sends a raw slack message with this webhook.
	 *
	 * @param {Object} body The raw body to send
	 * @returns {Promise<boolean>}
	 * @example
	 * // Send a slack message
	 * webhook.sendSlackMessage({
	 *   'username': 'Wumpus',
	 *   'attachments': [{
	 *     'pretext': 'this looks pretty cool',
	 *     'color': '#F0F',
	 *     'footer_icon': 'http://snek.s3.amazonaws.com/topSnek.png',
	 *     'footer': 'Powered by sneks',
	 *     'ts': Date.now() / 1_000
	 *   }]
	 * }).catch(console.error);
	 * @see {@link https://api.slack.com/messaging/webhooks}
	 */
	async sendSlackMessage(body: Record<string, unknown>) {
		if (!this.token) throw new DiscordjsError(ErrorCodes.WebhookTokenUnavailable);

		const data = (await this.client.rest.post(Routes.webhookPlatform(this.id, this.token, 'slack'), {
			query: makeURLSearchParams({ wait: true }),
			auth: false,
			body,
		})) as { toString(): string };
		return data.toString() === 'ok';
	}

	/**
	 * Options used to edit a {@link Webhook}.
	 *
	 * @typedef {Object} WebhookEditOptions
	 * @property {string} [name=this.name] The new name for the webhook
	 * @property {?(BufferResolvable)} [avatar] The new avatar for the webhook
	 * @property {GuildTextChannelResolvable|VoiceChannel|StageChannel|ForumChannel|MediaChannel} [channel]
	 * The new channel for the webhook
	 * @property {string} [reason] Reason for editing the webhook
	 */

	async edit({ name = this.name, avatar: newAvatar, channel: newChannel, reason }: WebhookEditOptions) {
		let avatar = newAvatar as string | Buffer | null;
		if (avatar && !(typeof avatar === 'string' && avatar.startsWith('data:'))) {
			avatar = (await resolveImage(avatar)) as string | null;
		}

		const channel = (newChannel as any)?.id ?? newChannel;
		const data = (await this.client.rest.patch(Routes.webhook(this.id, channel ? undefined : this.token), {
			body: { name, avatar, channel_id: channel as Snowflake },
			reason: reason as string | undefined,
			auth: !this.token || Boolean(channel),
		})) as any;

		this.name = data.name as string;
		this.avatar = data.avatar as string;
		this.channelId = data.channel_id as Snowflake;
		return this;
	}

	/**
	 * Options that can be passed into fetchMessage.
	 *
	 * @typedef {options} WebhookFetchMessageOptions
	 * @property {boolean} [cache=true] Whether to cache the message.
	 * @property {Snowflake} [threadId] The id of the thread this message belongs to.
	 * <info>For interaction webhooks, this property is ignored</info>
	 */

	async fetchMessage(
		message: string | MessageResolvable,
		{ threadId }: WebhookFetchMessageOptions = {},
	): Promise<Message> {
		if (!this.token) throw new DiscordjsError(ErrorCodes.WebhookTokenUnavailable);

		const data = (await this.client.rest.get(
			Routes.webhookMessage(this.id, this.token, typeof message === 'string' ? message : message.id),
			{
				query: threadId ? makeURLSearchParams({ thread_id: threadId as Snowflake }) : undefined,
				auth: false,
			},
		)) as any;

		return (
			this.client.channels.cache.get(data.channel_id as Snowflake)?.messages._add(data, false) ??
			new (getMessage())(this.client, data)
		);
	}

	async editMessage(
		message: string | MessageResolvable,
		options: string | MessagePayload | WebhookMessageEditOptions,
	): Promise<Message> {
		if (!this.token) throw new DiscordjsError(ErrorCodes.WebhookTokenUnavailable);

		let messagePayload: MessagePayload;

		if (options instanceof MessagePayload) messagePayload = options;
		else messagePayload = MessagePayload.create(this, options);

		const { body, files } = await messagePayload.resolveBody().resolveFiles();

		const query = makeURLSearchParams({
			thread_id: (messagePayload.options as any).threadId as Snowflake | undefined,
			with_components: (messagePayload.options as any).withComponents as boolean | undefined,
		});

		const messageId = typeof message === 'string' ? message : message.id;

		const data = (await this.client.rest.patch(Routes.webhookMessage(this.id, this.token, messageId), {
			body,
			files,
			query,
			auth: false,
		})) as any;

		const messageManager = this.client.channels.cache.get(data.channel_id as Snowflake)?.messages;
		if (!messageManager) return new (getMessage())(this.client, data as any);

		const existing = messageManager.cache.get(data.id as Snowflake);
		if (!existing) return messageManager._add(data);

		const clone = (existing as any)._clone();
		clone._patch(data);
		return clone;
	}

	/**
	 * Deletes the webhook.
	 *
	 * @param {string} [reason] Reason for deleting this webhook
	 * @returns {Promise<void>}
	 */
	async delete(reason?: string) {
		return this.client.deleteWebhook(this.id, { token: this.token as string, reason });
	}

	/**
	 * Delete a message that was sent by this webhook.
	 *
	 * @param {MessageResolvable|'@original'} message The message to delete
	 * @param {Snowflake} [threadId] The id of the thread this message belongs to
	 * @returns {Promise<void>}
	 */
	async deleteMessage(message: string | MessageResolvable, threadId?: Snowflake) {
		if (!this.token) throw new DiscordjsError(ErrorCodes.WebhookTokenUnavailable);

		const messageId = typeof message === 'string' ? message : message.id;

		await this.client.rest.delete(Routes.webhookMessage(this.id, this.token, messageId), {
			query: threadId ? makeURLSearchParams({ thread_id: threadId }) : undefined,
			auth: false,
		});
	}

	/**
	 * The timestamp the webhook was created at
	 *
	 * @type {number}
	 * @readonly
	 */
	get createdTimestamp() {
		return DiscordSnowflake.timestampFrom(this.id);
	}

	/**
	 * The time the webhook was created at
	 *
	 * @type {Date}
	 * @readonly
	 */
	get createdAt() {
		return new Date(this.createdTimestamp);
	}

	/**
	 * The URL of this webhook
	 *
	 * @type {string}
	 * @readonly
	 */
	get url() {
		return this.client.options.rest.api + Routes.webhook(this.id, this.token);
	}

	/**
	 * A link to the webhook's avatar.
	 *
	 * @param {ImageURLOptions} [options={}] Options for the image URL
	 * @returns {?string}
	 */
	avatarURL(options = {}) {
		return this.avatar && this.client.rest.cdn.avatar(this.id, this.avatar, options);
	}

	/**
	 * Whether this webhook is created by a user.
	 *
	 * @returns {boolean}
	 */
	isUserCreated() {
		return Boolean(this.type === WebhookType.Incoming && this.owner && !this.owner.bot);
	}

	/**
	 * Whether this webhook is created by an application.
	 *
	 * @returns {boolean}
	 */
	isApplicationCreated() {
		return this.type === WebhookType.Application;
	}

	/**
	 * Whether or not this webhook is a channel follower webhook.
	 *
	 * @returns {boolean}
	 */
	isChannelFollower() {
		return this.type === WebhookType.ChannelFollower;
	}

	/**
	 * Whether or not this webhook is an incoming webhook.
	 *
	 * @returns {boolean}
	 */
	isIncoming() {
		return this.type === WebhookType.Incoming;
	}

	static applyToClass(structure: any, ignore: string[] = []) {
		for (const prop of [
			'send',
			'sendSlackMessage',
			'fetchMessage',
			'edit',
			'editMessage',
			'delete',
			'deleteMessage',
			'createdTimestamp',
			'createdAt',
			'url',
		]) {
			if (ignore.includes(prop)) continue;
			Object.defineProperty(
				structure.prototype as object,
				prop,
				Object.getOwnPropertyDescriptor(Webhook.prototype, prop) as PropertyDescriptor,
			);
		}
	}
}
