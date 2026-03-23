import {
	type APIApplicationCommandAutocompleteInteraction,
	type APIApplicationCommandOptionChoice,
	type ApplicationCommandType,
	InteractionResponseType,
	type LocalizationMap,
	Routes,
	type Snowflake,
} from 'discord-api-types/v10';
import type { Client } from '../client/Client.js';
import { DiscordjsError, ErrorCodes } from '../errors/index.js';
import { BaseInteraction } from './BaseInteraction.js';
import { CommandInteractionOptionResolver } from './CommandInteractionOptionResolver.js';

export interface ApplicationCommandOptionChoiceData {
	name: string;
	nameLocalizations?: LocalizationMap;
	value: string | number;
}

/**
 * Represents an autocomplete interaction.
 *
 * @extends {BaseInteraction}
 */
export class AutocompleteInteraction extends BaseInteraction {
	/**
	 * The invoked application command's id
	 */
	public commandId: Snowflake;

	/**
	 * The invoked application command's name
	 */
	public commandName: string;

	/**
	 * The invoked application command's type
	 */
	public commandType: ApplicationCommandType;

	/**
	 * The id of the guild the invoked application command is registered to
	 */
	public commandGuildId: Snowflake | null;

	/**
	 * Whether this interaction has already received a response
	 */
	public responded: boolean;

	/**
	 * The options passed to the command
	 */
	public options: CommandInteractionOptionResolver;

	constructor(client: Client, data: APIApplicationCommandAutocompleteInteraction) {
		super(client, data);

		/**
		 * The id of the channel this interaction was sent in
		 *
		 * @type {Snowflake}
		 * @name AutocompleteInteraction#channelId
		 */

		/**
		 * The invoked application command's id
		 *
		 * @type {Snowflake}
		 */
		this.commandId = data.data.id;

		/**
		 * The invoked application command's name
		 *
		 * @type {string}
		 */
		this.commandName = data.data.name;

		/**
		 * The invoked application command's type
		 *
		 * @type {ApplicationCommandType}
		 */
		this.commandType = data.data.type;

		/**
		 * The id of the guild the invoked application command is registered to
		 *
		 * @type {?Snowflake}
		 */
		this.commandGuildId = data.data.guild_id ?? null;

		/**
		 * Whether this interaction has already received a response
		 *
		 * @type {boolean}
		 */
		this.responded = false;

		/**
		 * The options passed to the command
		 *
		 * @type {CommandInteractionOptionResolver}
		 */
		this.options = new CommandInteractionOptionResolver(
			this.client,
			data.data.options ?? [],
			// This is passed as any because the resolver expects a structure that we don't have here.
			undefined as unknown as any,
		);
	}

	/**
	 * The invoked application command, if it was fetched before
	 *
	 * @type {?ApplicationCommand}
	 */
	get command() {
		const id = this.commandId;
		return this.guild?.commands.cache.get(id) ?? this.client.application.commands.cache.get(id) ?? null;
	}

	/**
	 * Sends results for the autocomplete of this interaction.
	 *
	 * @param {ApplicationCommandOptionChoiceData[]} options The options for the autocomplete
	 * @returns {Promise<void>}
	 * @example
	 * // respond to autocomplete interaction
	 * interaction.respond([
	 *  {
	 *    name: 'Option 1',
	 *    value: 'option1',
	 *  },
	 * ])
	 *  .then(() => console.log('Successfully responded to the autocomplete interaction'))
	 *  .catch(console.error);
	 */
	async respond(options: ApplicationCommandOptionChoiceData[]) {
		if (this.responded) throw new DiscordjsError(ErrorCodes.InteractionAlreadyReplied);

		await this.client.rest.post(Routes.interactionCallback(this.id, this.token), {
			body: {
				type: InteractionResponseType.ApplicationCommandAutocompleteResult,
				data: {
					choices: options.map(({ nameLocalizations, ...option }) => ({
						...this.client.options.jsonTransformer(option),
						name_localizations: nameLocalizations,
					})),
				},
			},
			auth: false,
		});
		this.responded = true;
	}
}
