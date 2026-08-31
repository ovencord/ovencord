import type { APIMediaGalleryItem, APIUnfurledMediaItem } from 'discord-api-types/v10';
import { UnfurledMediaItem } from './UnfurledMediaItem.js';

/**
 * Represents an item in a media gallery
 */
export class MediaGalleryItem {
	public data: APIMediaGalleryItem;
	public media: UnfurledMediaItem;
	constructor({ media, ...data }: APIMediaGalleryItem & { media?: APIUnfurledMediaItem | UnfurledMediaItem }) {
		/**
		 * The API data associated with this component
		 *
		 * @type {APIMediaGalleryItem}
		 */
		this.data = data as unknown as APIMediaGalleryItem;

		/**
		 * The media associated with this media gallery item
		 *
		 * @type {UnfurledMediaItem}
		 * @readonly
		 */
		this.media =
			media instanceof UnfurledMediaItem ? media : new UnfurledMediaItem(media ?? ({} as APIUnfurledMediaItem));
	}

	/**
	 * The description of this media gallery item
	 *
	 * @type {?string}
	 * @readonly
	 */
	get description() {
		return this.data.description ?? null;
	}

	/**
	 * Whether this media gallery item is spoilered
	 *
	 * @type {boolean}
	 * @readonly
	 */
	get spoiler() {
		return this.data.spoiler ?? false;
	}

	/**
	 * Returns the API-compatible JSON for this component
	 *
	 * @returns {APIMediaGalleryItem}
	 */
	toJSON() {
		return { ...this.data, media: this.media.toJSON() };
	}
}
