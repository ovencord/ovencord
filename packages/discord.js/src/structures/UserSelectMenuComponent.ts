import type { APIUserSelectComponent } from 'discord-api-types/v10';
import { BaseSelectMenuComponent } from './BaseSelectMenuComponent.js';

/**
 * Represents a user select menu component
 *
 * @extends {BaseSelectMenuComponent}
 */
export class UserSelectMenuComponent extends BaseSelectMenuComponent {
	/**
	 * The default values for this select menu.
	 */
	public get defaultValues() {
		return (this.data as APIUserSelectComponent).default_values;
	}
}
