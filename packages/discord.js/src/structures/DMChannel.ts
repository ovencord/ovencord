import { userMention } from '@ovencord/formatters';
import { type APIChannel, ChannelType, type Snowflake } from 'discord-api-types/v10';
import type { Client } from '../client/Client.js';
import { DMMessageManager } from '../managers/DMMessageManager.js';
import { Partials } from '../util/Partials.js';
import { BaseChannel } from './BaseChannel.js';
import { TextBasedChannel } from './interfaces/TextBasedChannel.js';
import type { Message } from './Message.js';
import type { User } from './User.js';

/**
 * Represents a direct message channel between two users.
 *
 * @extends {BaseChannel}
 * @implements {TextBasedChannel}
 */
export class DMChannel extends BaseChannel {
	public type: ChannelType.DM;
	public messages: DMMessageManager;
	public recipientId: Snowflake | null;
	public lastMessageId: Snowflake | null;
	public lastPinTimestamp: number | null;
	constructor(client: Client, data: APIChannel) {
		super(client, data);

		// Override the channel type so partials have a known type
		this.type = ChannelType.DM;

		/**
		 * A manager of the messages belonging to this channel
		 *
		 * @type {DMMessageManager}
		 */
		this.messages = new DMMessageManager(this);
	}

	_patch(data: APIChannel) {
		super._patch(data);

		if ('recipients' in data && data.recipients) {
			const recipient = data.recipients[0];

			/**
			 * The recipient's id
			 *
			 * @type {Snowflake}
			 */
			this.recipientId = recipient.id;

			if ('username' in recipient || this.client.options.partials.includes(Partials.User)) {
				this.client.users._add(recipient);
			}
		}

		if ('last_message_id' in data) {
			/**
			 * The channel's last message id, if one was sent
			 *
			 * @type {?Snowflake}
			 */
			this.lastMessageId = data.last_message_id;
		}

		if ('last_pin_timestamp' in data) {
			/**
			 * The timestamp when the last pinned message was pinned, if there was one
			 *
			 * @type {?number}
			 */
			this.lastPinTimestamp = Date.parse(data.last_pin_timestamp);
		} else {
			this.lastPinTimestamp ??= null;
		}
	}

	/**
	 * Whether this DMChannel is a partial
	 *
	 * @type {boolean}
	 * @readonly
	 */
	get partial() {
		return this.lastMessageId === undefined;
	}

	/**
	 * The recipient on the other end of the DM
	 *
	 * @type {?User}
	 * @readonly
	 */
	get recipient() {
		return this.client.users.resolve(this.recipientId);
	}

	/**
	 * Fetch this DMChannel.
	 *
	 * @param {boolean} [force=true] Whether to skip the cache check and request the API
	 * @returns {Promise<DMChannel>}
	 */
	async fetch(force = true) {
		return this.client.users.createDM(this.recipientId, { force });
	}

	/**
	 * When concatenated with a string, this automatically returns the recipient's mention instead of the
	 * DMChannel object.
	 *
	 * @returns {string}
	 * @example
	 * // Logs: Hello from <@123456789012345678>!
	 * console.log(`Hello from ${channel}!`);
	 */
	// @ts-expect-error
	toString(): string {
		return userMention(this.recipientId);
	}

	// These are here only for documentation purposes - they are implemented by TextBasedChannel

	get lastMessage(): Message | null {
		return (this.lastMessageId && this.messages.cache.get(this.lastMessageId)) ?? null;
	}

	get lastPinAt(): Date | null {
		return this.lastPinTimestamp ? new Date(this.lastPinTimestamp) : null;
	}

	send() {}

	sendTyping() {}

	createMessageCollector() {}

	awaitMessages() {}

	createMessageComponentCollector() {}

	awaitMessageComponent() {}
	// Doesn't work on DM channels; bulkDelete() {}
	// Doesn't work on DM channels; fetchWebhooks() {}
	// Doesn't work on DM channels; createWebhook() {}
	// Doesn't work on DM channels; setRateLimitPerUser() {}
	// Doesn't work on DM channels; setNSFW() {}
}

TextBasedChannel.applyToClass(DMChannel, [
	'bulkDelete',
	'fetchWebhooks',
	'createWebhook',
	'setRateLimitPerUser',
	'setNSFW',
] as any);
