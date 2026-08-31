import type { GatewayTypingStartDispatchData } from 'discord-api-types/v10';
import type { Client } from '../client/Client.js';
import { Base } from './Base.js';
import type { TextBasedChannel } from './interfaces/TextBasedChannel.js';
import type { User } from './User.js';

/**
 * Represents a typing state for a user in a channel.
 *
 * @extends {Base}
 */
export class Typing extends Base {
	public channel: TextBasedChannel;
	public user: User;
	public startedTimestamp: number;
	constructor(channel: TextBasedChannel, user: User, data: GatewayTypingStartDispatchData) {
		super(channel.client as Client);

		/**
		 * The channel the status is from
		 *
		 * @type {TextBasedChannels}
		 */
		this.channel = channel;

		/**
		 * The user who is typing
		 *
		 * @type {User}
		 */
		this.user = user;

		this._patch(data);
	}

	_patch(data: GatewayTypingStartDispatchData) {
		if ('timestamp' in data) {
			/**
			 * The UNIX timestamp in milliseconds the user started typing at
			 *
			 * @type {number}
			 */
			this.startedTimestamp = (data.timestamp as number) * 1_000;
		}
	}

	/**
	 * Indicates whether the status is received from a guild.
	 *
	 * @returns {boolean}
	 */
	inGuild() {
		return this.guild !== null;
	}

	/**
	 * The time the user started typing at
	 *
	 * @type {Date}
	 * @readonly
	 */
	get startedAt() {
		return new Date(this.startedTimestamp);
	}

	/**
	 * The guild the status is from
	 *
	 * @type {?Guild}
	 * @readonly
	 */
	get guild() {
		return this.channel.guild ?? null;
	}

	/**
	 * The member who is typing
	 *
	 * @type {?GuildMember}
	 * @readonly
	 */
	get member() {
		return this.guild?.members.resolve(this.user) ?? null;
	}
}
