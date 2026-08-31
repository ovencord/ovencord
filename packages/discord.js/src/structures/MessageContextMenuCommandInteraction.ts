import type { APIMessage, Snowflake } from 'discord-api-types/v10';
import { ContextMenuCommandInteraction } from './ContextMenuCommandInteraction.js';
import type { Message } from './Message.js';

/**
 * Represents a message context menu interaction.
 *
 * @extends {ContextMenuCommandInteraction}
 */
export class MessageContextMenuCommandInteraction extends ContextMenuCommandInteraction {
	public targetId: Snowflake;
	/**
	 * The message this interaction was sent from
	 *
	 * @type {Message|APIMessage}
	 * @readonly
	 */
	get targetMessage(): Message | APIMessage | null {
		return this.options.getMessage('message') as Message | APIMessage | null;
	}
}
