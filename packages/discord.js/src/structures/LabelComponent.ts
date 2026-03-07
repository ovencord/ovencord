import type { APIComponentInLabel, APILabelComponent, APIMessageComponent } from 'discord-api-types/v10';
import { createComponent } from '../util/Components.js';
import { Component } from './Component.js';

/**
 * Represents a label component
 *
 * @extends {Component}
 */
export class LabelComponent extends Component {
	public component: Component;
	constructor({ component, ...data }: Partial<APILabelComponent> & { component?: APIComponentInLabel | Component }) {
		super(data as unknown as APIMessageComponent);

		/**
		 * The component in this label
		 *
		 * @type {Component}
		 * @readonly
		 */
		this.component = createComponent(component);
	}

	/**
	 * The label of the component
	 *
	 * @type {string}
	 * @readonly
	 */
	get label() {
		return (this.data as unknown as APILabelComponent).label;
	}

	/**
	 * The description of this component
	 *
	 * @type {?string}
	 * @readonly
	 */
	get description() {
		return (this.data as unknown as APILabelComponent).description ?? null;
	}

	/**
	 * Returns the API-compatible JSON for this component
	 *
	 * @returns {APILabelComponent}
	 */
	toJSON() {
		return { ...this.data, component: this.component.toJSON() };
	}
}
