import type { APIEmoji, Snowflake } from 'discord-api-types/v10';
import type { Client } from '../client/Client.js';
import { BaseGuildEmoji } from './BaseGuildEmoji.js';
import type { GuildPreview } from './GuildPreview.js';

/**
 * Represents an instance of an emoji belonging to a public guild obtained through Discord's preview endpoint.
 *
 * @extends {BaseGuildEmoji}
 */
export class GuildPreviewEmoji extends BaseGuildEmoji {
	public roles: Snowflake[];
	/**
	 * The public guild this emoji is part of
	 *
	 * @type {GuildPreview}
	 * @name GuildPreviewEmoji#guild
	 */

	constructor(client: Client, data: APIEmoji, guild: GuildPreview) {
		super(client, data, guild);

		/**
		 * The roles this emoji is active for
		 *
		 * @type {Snowflake[]}
		 */
		this.roles = data.roles ?? [];
	}
}
