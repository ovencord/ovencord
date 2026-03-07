import type { APIUnfurledMediaItem } from 'discord-api-types/v10';

/**
 * Represents a media item in a component
 */
export class UnfurledMediaItem {
	public data: APIUnfurledMediaItem;
	constructor(data: APIUnfurledMediaItem) {
		/**
		 * The API data associated with this media item
		 *
		 * @type {APIUnfurledMediaItem}
		 */
		this.data = data;
	}

	/**
	 * The URL of this media item
	 *
	 * @type {string}
	 * @readonly
	 */
	get url() {
		return this.data.url;
	}

	/**
	 * Returns the API-compatible JSON for this media item
	 *
	 * @returns {APIUnfurledMediaItem}
	 */
	toJSON() {
		return { ...this.data };
	}
}
