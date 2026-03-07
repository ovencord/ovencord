import type { APIMediaGalleryComponent, APIMediaGalleryItem, APIMessageComponent } from 'discord-api-types/v10';
import { Component } from './Component.js';
import { MediaGalleryItem } from './MediaGalleryItem.js';

/**
 * Represents a media gallery component
 *
 * @extends {Component}
 */
export class MediaGalleryComponent extends Component {
	public items: MediaGalleryItem[];
	constructor({
		items,
		...data
	}: Partial<APIMediaGalleryComponent> & { items?: (APIMediaGalleryItem | MediaGalleryItem)[] }) {
		super(data as unknown as APIMessageComponent);

		/**
		 * The items in this media gallery
		 *
		 * @type {MediaGalleryItem[]}
		 * @readonly
		 */
		this.items = items?.map((item) => new MediaGalleryItem(item)) ?? [];
	}

	/**
	 * Returns the API-compatible JSON for this component
	 *
	 * @returns {APIMediaGalleryComponent}
	 */
	toJSON() {
		return { ...this.data, items: this.items.map((item) => item.toJSON()) } as unknown as APIMediaGalleryComponent;
	}
}
