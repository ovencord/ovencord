import type { APIRoleSelectComponent } from 'discord-api-types/v10';
import { BaseSelectMenuComponent } from './BaseSelectMenuComponent.js';

/**
 * Represents a role select menu component
 *
 * @extends {BaseSelectMenuComponent}
 */
export class RoleSelectMenuComponent extends BaseSelectMenuComponent {
	/**
	 * The default values for the select menu.
	 */
	public get defaultValues(): APIRoleSelectComponent['default_values'] | undefined {
		return (this.data as APIRoleSelectComponent).default_values;
	}
}
