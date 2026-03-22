import { Collection } from '@ovencord/collection';
import { DiscordSnowflake } from '@ovencord/util';
import type { Snowflake } from 'discord-api-types/v10';
import type { Client } from '../client/Client.js';
import { Base } from './Base.js';
import { Sticker } from './Sticker.js';

/**
 * Represents a pack of standard stickers.
 *
 * @extends {Base}
 */
export class StickerPack extends Base {
	public id: Snowflake;
	public stickers: Collection<Snowflake, Sticker>;
	public name: string;
	public skuId: Snowflake;
	public coverStickerId: Snowflake | null;
	public description: string;
	public bannerId: Snowflake | null;
	constructor(client: Client, pack: Record<string, unknown>) {
		super(client);
		/**
		 * The Sticker pack's id
		 *
		 * @type {Snowflake}
		 */
		this.id = pack.id as Snowflake;

		/**
		 * The stickers in the pack
		 *
		 * @type {Collection<Snowflake, Sticker>}
		 */
		this.stickers = new Collection(
			(pack.stickers as Record<string, unknown>[]).map((sticker) => [
				sticker.id as Snowflake,
				new Sticker(client, sticker),
			]),
		);

		/**
		 * The name of the sticker pack
		 *
		 * @type {string}
		 */
		this.name = pack.name as string;

		/**
		 * The id of the pack's SKU
		 *
		 * @type {Snowflake}
		 */
		this.skuId = pack.sku_id as Snowflake;

		/**
		 * The id of a sticker in the pack which is shown as the pack's icon
		 *
		 * @type {?Snowflake}
		 */
		this.coverStickerId = (pack.cover_sticker_id as Snowflake) ?? null;

		/**
		 * The description of the sticker pack
		 *
		 * @type {string}
		 */
		this.description = pack.description as string;

		/**
		 * The id of the sticker pack's banner image
		 *
		 * @type {?Snowflake}
		 */
		this.bannerId = (pack.banner_asset_id as Snowflake) ?? null;
	}

	/**
	 * The timestamp the sticker was created at
	 *
	 * @type {number}
	 * @readonly
	 */
	get createdTimestamp() {
		return DiscordSnowflake.timestampFrom(this.id);
	}

	/**
	 * The time the sticker was created at
	 *
	 * @type {Date}
	 * @readonly
	 */
	get createdAt() {
		return new Date(this.createdTimestamp);
	}

	/**
	 * The sticker which is shown as the pack's icon
	 *
	 * @type {?Sticker}
	 * @readonly
	 */
	get coverSticker() {
		return this.coverStickerId && this.stickers.get(this.coverStickerId);
	}

	/**
	 * The URL to this sticker pack's banner.
	 *
	 * @param {ImageURLOptions} [options={}] Options for the image URL
	 * @returns {?string}
	 */
	bannerURL(options = {}) {
		return this.bannerId && this.client.rest.cdn.stickerPackBanner(this.bannerId, options);
	}
}
