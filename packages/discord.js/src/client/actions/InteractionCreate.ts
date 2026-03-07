import type {
	APIApplicationCommandInteraction,
	APIMessageComponentInteraction,
	GatewayInteractionCreateDispatchData,
} from 'discord-api-types/v10';
import { ApplicationCommandType, ComponentType, InteractionType } from 'discord-api-types/v10';
import { AutocompleteInteraction } from '../../structures/AutocompleteInteraction.js';
import type { BaseInteraction } from '../../structures/BaseInteraction.js';
import { ButtonInteraction } from '../../structures/ButtonInteraction.js';
import { ChannelSelectMenuInteraction } from '../../structures/ChannelSelectMenuInteraction.js';
import { ChatInputCommandInteraction } from '../../structures/ChatInputCommandInteraction.js';
import { MentionableSelectMenuInteraction } from '../../structures/MentionableSelectMenuInteraction.js';
import { MessageContextMenuCommandInteraction } from '../../structures/MessageContextMenuCommandInteraction.js';
import { ModalSubmitInteraction } from '../../structures/ModalSubmitInteraction.js';
import { PrimaryEntryPointCommandInteraction } from '../../structures/PrimaryEntryPointCommandInteraction.js';
import { RoleSelectMenuInteraction } from '../../structures/RoleSelectMenuInteraction.js';
import { StringSelectMenuInteraction } from '../../structures/StringSelectMenuInteraction.js';
import { UserContextMenuCommandInteraction } from '../../structures/UserContextMenuCommandInteraction.js';
import { UserSelectMenuInteraction } from '../../structures/UserSelectMenuInteraction.js';
import { Events } from '../../util/Events.js';
import type { Client } from '../Client.js';
import { Action } from './Action.js';

type InteractionConstructor = new (client: Client, data: GatewayInteractionCreateDispatchData) => BaseInteraction;

export class InteractionCreateAction extends Action {
	override handle(data: GatewayInteractionCreateDispatchData) {
		const client = this.client;

		// Resolve and cache partial channels for Interaction#channel getter
		const channel = data.channel && this.getChannel(data.channel);

		// Do not emit this for interactions that cache messages that are non-text-based.
		let InteractionClass: InteractionConstructor | undefined;

		switch (data.type) {
			case InteractionType.ApplicationCommand:
				switch ((data as APIApplicationCommandInteraction).data.type) {
					case ApplicationCommandType.ChatInput:
						InteractionClass = ChatInputCommandInteraction;
						break;
					case ApplicationCommandType.User:
						InteractionClass = UserContextMenuCommandInteraction;
						break;
					case ApplicationCommandType.Message:
						if (channel && !channel.isTextBased()) return;
						InteractionClass = MessageContextMenuCommandInteraction;
						break;
					case ApplicationCommandType.PrimaryEntryPoint:
						InteractionClass = PrimaryEntryPointCommandInteraction;
						break;
					default:
						client.emit(
							Events.Debug,
							`[INTERACTION] Received application command interaction with unknown type: ${data.data.type}`,
						);
						return;
				}

				break;
			case InteractionType.MessageComponent:
				if (channel && !channel.isTextBased()) return;

				switch ((data as APIMessageComponentInteraction).data.component_type) {
					case ComponentType.Button:
						InteractionClass = ButtonInteraction;
						break;
					case ComponentType.StringSelect:
						InteractionClass = StringSelectMenuInteraction;
						break;
					case ComponentType.UserSelect:
						InteractionClass = UserSelectMenuInteraction;
						break;
					case ComponentType.RoleSelect:
						InteractionClass = RoleSelectMenuInteraction;
						break;
					case ComponentType.MentionableSelect:
						InteractionClass = MentionableSelectMenuInteraction;
						break;
					case ComponentType.ChannelSelect:
						InteractionClass = ChannelSelectMenuInteraction;
						break;
					default:
						client.emit(
							Events.Debug,
							`[INTERACTION] Received component interaction with unknown type: ${data.data.component_type}`,
						);
						return;
				}

				break;
			case InteractionType.ApplicationCommandAutocomplete:
				InteractionClass = AutocompleteInteraction;
				break;
			case InteractionType.ModalSubmit:
				InteractionClass = ModalSubmitInteraction;
				break;
			default:
				client.emit(Events.Debug, `[INTERACTION] Received interaction with unknown type: ${data.type}`);
				return;
		}

		if (!InteractionClass) return;
		const interaction = new InteractionClass(client, data);

		/**
		 * Emitted when an interaction is created.
		 *
		 * @event Client#interactionCreate
		 * @param {BaseInteraction} interaction The interaction which was created
		 */
		client.emit(Events.InteractionCreate, interaction);
	}
}
