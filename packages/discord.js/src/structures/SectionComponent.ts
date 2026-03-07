import type { APIMessageComponent, APISectionComponent } from 'discord-api-types/v10';
import { createComponent } from '../util/Components.js';
import type { ButtonComponent } from './ButtonComponent.js';
import { Component } from './Component.js';
import type { ThumbnailComponent } from './ThumbnailComponent.js';

/**
 * Represents a section component
 *
 * @extends {Component}
 */
export class SectionComponent extends Component {
	public components: Component[];
	public accessory: ButtonComponent | ThumbnailComponent | Component;
	constructor({
		accessory,
		components,
		...data
	}: Partial<APISectionComponent> & { accessory?: unknown; components?: unknown[] }) {
		super(data as unknown as APIMessageComponent);

		/**
		 * The components in this section
		 *
		 * @type {Component[]}
		 * @readonly
		 */
		this.components = components?.map((component) => createComponent(component)) ?? [];

		/**
		 * The accessory component of this section
		 *
		 * @type {Component}
		 * @readonly
		 */
		this.accessory = createComponent(accessory) as ButtonComponent | ThumbnailComponent | Component;
	}

	/**
	 * Returns the API-compatible JSON for this component
	 *
	 * @returns {APISectionComponent}
	 */
	toJSON() {
		return {
			...this.data,
			accessory: (this.accessory as unknown as { toJSON(): unknown }).toJSON(),
			components: this.components.map((component: Component | unknown) =>
				(component as { toJSON(): unknown }).toJSON(),
			),
		} as unknown as APISectionComponent;
	}
}
