import type { APIActionRowComponent, APIComponentInMessageActionRow, APIMessageComponent } from 'discord-api-types/v10';
import { createComponent } from '../util/Components.js';
import { Component } from './Component.js';

/**
 * Represents an action row
 *
 * @extends {Component}
 */
export class ActionRow extends Component {
	public components: Component[];
	constructor({
		components,
		...data
	}: Partial<APIActionRowComponent<APIComponentInMessageActionRow>> & {
		components?: (APIComponentInMessageActionRow | Component)[];
	}) {
		super(data as unknown as APIMessageComponent);

		/**
		 * The components in this action row
		 *
		 * @type {Component[]}
		 * @readonly
		 */
		this.components = components?.map((component) => createComponent(component)) ?? [];
	}

	/**
	 * Returns the API-compatible JSON for this component
	 *
	 * @returns {APIActionRowComponent}
	 */
	toJSON() {
		return {
			...this.data,
			components: this.components.map((component) => component.toJSON()),
		} as unknown as APIActionRowComponent<APIComponentInMessageActionRow>;
	}
}
