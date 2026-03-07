import type { APIStringSelectComponent } from 'discord-api-types/v10';
import { BaseSelectMenuComponent } from './BaseSelectMenuComponent.js';

/**
 * Represents a string select menu component
 *
 * @extends {BaseSelectMenuComponent}
 */
export class StringSelectMenuComponent extends BaseSelectMenuComponent {
	/**
	 * The options in this select menu
	 *
	 * @type {APISelectMenuOption[]}
	 * @readonly
	 */
	get options() {
		return (this.data as APIStringSelectComponent).options;
	}
}
