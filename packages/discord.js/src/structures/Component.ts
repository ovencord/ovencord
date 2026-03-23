import type { APIMessageComponent } from 'discord-api-types/v10';

/**
 * Represents a component
 */
export class Component {
	public data: APIMessageComponent;
	constructor(data: APIMessageComponent) {
		/**
		 * The API data associated with this component
		 *
		 * @type {APIMessageComponent}
		 */
		this.data = data;
	}


	/**
	 * The type of the component
	 *
	 * @type {ComponentType}
	 * @readonly
	 */
	get type() {
		return this.data.type;
	}

	/**
	 * Whether or not the given components are equal
	 *
	 * @param {Component|APIMessageComponent} other The component to compare against
	 * @returns {boolean}
	 */
	equals(other: Component | APIMessageComponent) {
		if (other instanceof Component) {
			return Bun.deepEquals(other.data, this.data);
		}

		return Bun.deepEquals(other, this.data);
	}

	/**
	 * Returns the API-compatible JSON for this component
	 *
	 * @returns {APIMessageComponent}
	 */
	toJSON() {
		return { ...this.data };
	}
}
