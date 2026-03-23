import type { APIMessageComponentInteraction } from 'discord-api-types/v10';
import type { Client } from '../client/Client.js';
import { MessageComponentInteraction } from './MessageComponentInteraction.js';

/**
 * Represents a {@link ComponentType.StringSelect} select menu interaction.
 *
 * @extends {MessageComponentInteraction}
 */
export class StringSelectMenuInteraction extends MessageComponentInteraction {
	public values: string[];
	constructor(client: Client, data: APIMessageComponentInteraction) {
		super(client, data);

		/**
		 * The values selected
		 *
		 * @type {string[]}
		 */
		this.values = (data.data as any).values ?? [];
	}
}
