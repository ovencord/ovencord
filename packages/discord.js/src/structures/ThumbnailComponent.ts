import type { APIMessageComponent, APIThumbnailComponent, APIUnfurledMediaItem } from 'discord-api-types/v10';
import { Component } from './Component.js';
import { UnfurledMediaItem } from './UnfurledMediaItem.js';

/**
 * Represents a thumbnail component
 *
 * @extends {Component}
 */
export class ThumbnailComponent extends Component {
	public media: UnfurledMediaItem;
	constructor({
		media,
		...data
	}: Partial<APIThumbnailComponent> & { media?: APIUnfurledMediaItem | UnfurledMediaItem }) {
		super(data as unknown as APIMessageComponent);

		/**
		 * The media associated with this thumbnail
		 *
		 * @type {UnfurledMediaItem}
		 * @readonly
		 */
		this.media = new UnfurledMediaItem(media);
	}

	/**
	 * The description of this thumbnail
	 *
	 * @type {?string}
	 * @readonly
	 */
	get description() {
		return (this.data as unknown as APIThumbnailComponent).description ?? null;
	}

	/**
	 * Whether this thumbnail is spoilered
	 *
	 * @type {boolean}
	 * @readonly
	 */
	get spoiler() {
		return (this.data as unknown as APIThumbnailComponent).spoiler ?? false;
	}

	/**
	 * Returns the API-compatible JSON for this component
	 *
	 * @returns {APIThumbnailComponent}
	 */
	toJSON() {
		return { ...this.data, media: this.media.toJSON() };
	}
}
