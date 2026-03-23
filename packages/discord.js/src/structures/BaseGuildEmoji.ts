import type { APIEmoji, Snowflake } from 'discord-api-types/v10';
import type { Client } from '../client/Client.js';
import { Emoji } from './Emoji.js';
import type { Guild } from './Guild.js';
import type { GuildPreview } from './GuildPreview.js';

/**
 * Parent class for {@link GuildEmoji} and {@link GuildPreviewEmoji}.
 *
 * @extends {Emoji}
 * @abstract
 */
export class BaseGuildEmoji extends Emoji {
	public guild: Guild | GuildPreview;
	public requiresColons: boolean | null;
	public managed: boolean | null;
	public available: boolean | null;
	public declare name: string | null;

	constructor(client: Client, data: APIEmoji, guild: Guild | GuildPreview) {
		super(client, data);

		/**
		 * The guild this emoji is a part of
		 *
		 * @type {Guild|GuildPreview}
		 */
		this.guild = guild;

		this.requiresColons = null;
		this.managed = null;
		this.available = null;

		this._patch(data);
	}

	_patch(data: APIEmoji) {
		if ('name' in data) this.name = data.name;

		if ('require_colons' in data) {
			this.requiresColons = data.require_colons;
		}

		if ('managed' in data) {
			this.managed = data.managed;
		}

		if ('available' in data) {
			this.available = data.available;
		}
	}
}

/**
 * Returns a URL for the emoji.
 *
 * @method imageURL
 * @memberof BaseGuildEmoji
 * @instance
 * @param {EmojiURLOptions} [options={}] Options for the emoji URL
 * @returns {string}
 */

/**
 * The emoji's name
 *
 * @name name
 * @memberof BaseGuildEmoji
 * @instance
 * @type {string}
 * @readonly
 */

/**
 * Whether or not the emoji is animated
 *
 * @name animated
 * @memberof BaseGuildEmoji
 * @instance
 * @type {boolean}
 * @readonly
 */

/**
 * The time the emoji was created at.
 *
 * @name createdAt
 * @memberof BaseGuildEmoji
 * @instance
 * @type {Date}
 * @readonly
 */

/**
 * The timestamp the emoji was created at.
 *
 * @name createdTimestamp
 * @memberof BaseGuildEmoji
 * @instance
 * @type {number}
 * @readonly
 */
