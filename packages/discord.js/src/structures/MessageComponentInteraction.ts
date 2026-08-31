import { lazy } from '@ovencord/util';
import type {
	APIMessage,
	APIMessageComponentInteraction,
	APIMessageComponentInteractionData,
	ComponentType,
	Snowflake,
} from 'discord-api-types/v10';
import type { Client } from '../client/Client.js';
import { findComponentByCustomId } from '../util/Components.js';
import { BaseInteraction } from './BaseInteraction.js';
import { InteractionWebhook } from './InteractionWebhook.js';
import { InteractionResponses } from './interfaces/InteractionResponses.js';
import type { Message } from './Message.js';

const getMessage = lazy(() => require('./Message.js').Message);

/**
 * Represents a message component interaction.
 *
 * @extends {BaseInteraction}
 * @implements {InteractionResponses}
 */
export class MessageComponentInteraction extends BaseInteraction {
	public message: Message;
	public customId: string;
	public componentType: ComponentType;
	public deferred: boolean;
	public ephemeral: boolean | null;
	public replied: boolean;
	public webhook: InteractionWebhook;
	constructor(client: Client, data: APIMessageComponentInteraction) {
		super(client, data);

		/**
		 * The id of the channel this interaction was sent in
		 *
		 * @type {Snowflake}
		 * @name MessageComponentInteraction#channelId
		 */

		/**
		 * The message to which the component was attached
		 *
		 * @type {Message}
		 */
		this.message =
			this.channel?.messages._add(data.message as APIMessage) ?? new (getMessage())(client, data.message as APIMessage);

		/**
		 * The custom id of the component which was interacted with
		 *
		 * @type {string}
		 */
		this.customId = (data.data as APIMessageComponentInteractionData).custom_id;

		/**
		 * The type of component which was interacted with
		 *
		 * @type {ComponentType}
		 */
		this.componentType = (data.data as APIMessageComponentInteractionData).component_type;

		/**
		 * Whether the reply to this interaction has been deferred
		 *
		 * @type {boolean}
		 */
		this.deferred = false;

		/**
		 * Whether the reply to this interaction is ephemeral
		 *
		 * @type {?boolean}
		 */
		this.ephemeral = null;

		/**
		 * Whether this interaction has already been replied to
		 *
		 * @type {boolean}
		 */
		this.replied = false;

		/**
		 * An associated interaction webhook, can be used to further interact with this interaction
		 *
		 * @type {InteractionWebhook}
		 */
		this.webhook = new InteractionWebhook(this.client, this.applicationId, this.token);
	}

	/**
	 * Components that can be placed in an action row for messages.
	 * - ButtonComponent
	 * - StringSelectMenuComponent
	 * - UserSelectMenuComponent
	 * - RoleSelectMenuComponent
	 * - MentionableSelectMenuComponent
	 * - ChannelSelectMenuComponent
	 *
	 * @typedef {ButtonComponent|StringSelectMenuComponent|UserSelectMenuComponent|
	 * RoleSelectMenuComponent|MentionableSelectMenuComponent|ChannelSelectMenuComponent} MessageActionRowComponent
	 */

	/**
	 * The component which was interacted with
	 *
	 * @type {MessageActionRowComponent|APIComponentInMessageActionRow}
	 * @readonly
	 */
	get component() {
		return findComponentByCustomId(this.message.components, this.customId);
	}

	// These are here only for documentation purposes - they are implemented by InteractionResponses

	deferReply(_options?: any): any {}

	reply(_options?: any): any {}

	fetchReply(_options?: any): any {}

	editReply(_options?: any): any {}

	deleteReply(_options?: any): any {}

	followUp(_options?: any): any {}

	deferUpdate(_options?: any): any {}

	update(_options?: any): any {}

	launchActivity(_options?: any): any {}

	showModal(_modal?: any, _options?: any): any {}

	awaitModalSubmit(_options?: any): any {}
}

InteractionResponses.applyToClass(MessageComponentInteraction);
