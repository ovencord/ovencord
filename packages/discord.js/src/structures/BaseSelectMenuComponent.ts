import type { APISelectMenuComponent, APISelectMenuOption } from 'discord-api-types/v10';
import { Component } from './Component.js';

/**
 * Represents a select menu component
 *
 * @extends {Component}
 */
export class BaseSelectMenuComponent extends Component {
	/**
	 * The placeholder for this select menu
	 *
	 * @type {?string}
	 * @readonly
	 */
	get placeholder() {
		return (this.data as unknown as APISelectMenuComponent).placeholder ?? null;
	}

	/**
	 * The maximum amount of options that can be selected
	 *
	 * @type {?number}
	 * @readonly
	 */
	get maxValues() {
		return (this.data as unknown as APISelectMenuComponent).max_values ?? null;
	}

	/**
	 * The minimum amount of options that must be selected
	 *
	 * @type {?number}
	 * @readonly
	 */
	get minValues() {
		return (this.data as unknown as APISelectMenuComponent).min_values ?? null;
	}

	/**
	 * The custom id of this select menu
	 *
	 * @type {string}
	 * @readonly
	 */
	get customId() {
		return (this.data as unknown as APISelectMenuComponent).custom_id;
	}

	/**
	 * Whether this select menu is disabled
	 *
	 * @type {boolean}
	 * @readonly
	 */
	get disabled() {
		return (this.data as unknown as APISelectMenuComponent).disabled ?? false;
	}
}
