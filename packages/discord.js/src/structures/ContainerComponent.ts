import type { APIComponentInContainer, APIContainerComponent, APIMessageComponent } from 'discord-api-types/v10';
import { createComponent } from '../util/Components.js';
import { Component } from './Component.js';

/**
 * Represents a container component
 *
 * @extends {Component}
 */
export class ContainerComponent extends Component {
	public components: Component[];
	constructor({
		components,
		...data
	}: Partial<APIContainerComponent> & { components?: (APIComponentInContainer | Component)[] }) {
		super(data as unknown as APIMessageComponent);

		/**
		 * The components in this container
		 *
		 * @type {Component[]}
		 * @readonly
		 */
		this.components = components?.map((component) => createComponent(component)) ?? [];
	}

	/**
	 * The accent color of this container
	 *
	 * @type {?number}
	 * @readonly
	 */
	get accentColor() {
		return (this.data as unknown as APIContainerComponent).accent_color ?? null;
	}

	/**
	 * The hex accent color of this container
	 *
	 * @type {?string}
	 * @readonly
	 */
	get hexAccentColor() {
		const accentColor = (this.data as unknown as APIContainerComponent).accent_color;
		return typeof accentColor === 'number' ? `#${accentColor.toString(16).padStart(6, '0')}` : (accentColor ?? null);
	}

	/**
	 * Whether this container is spoilered
	 *
	 * @type {boolean}
	 * @readonly
	 */
	get spoiler() {
		return (this.data as unknown as APIContainerComponent).spoiler ?? false;
	}

	/**
	 * Returns the API-compatible JSON for this component
	 *
	 * @returns {APIContainerComponent}
	 */
	toJSON() {
		return {
			...this.data,
			components: this.components.map((component) => component.toJSON()),
		} as unknown as APIContainerComponent;
	}
}
