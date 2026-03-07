import type { APIMentionableSelectComponent } from 'discord-api-types/v10';
import { BaseSelectMenuComponent } from './BaseSelectMenuComponent.js';

/**
 * Represents a mentionable select menu component
 *
 * @extends {BaseSelectMenuComponent}
 */
export class MentionableSelectMenuComponent extends BaseSelectMenuComponent {
	/**
	 * The default values for this select menu.
	 */
	public get default_values() {
		return (this.data as APIMentionableSelectComponent).default_values;
	}
}
