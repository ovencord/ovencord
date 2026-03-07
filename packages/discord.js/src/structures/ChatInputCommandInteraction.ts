import type {
	APIApplicationCommandInteraction,
	APIChatInputApplicationCommandInteractionData,
} from 'discord-api-types/v10';
import type { Client } from '../client/Client.js';
import { transformResolved } from '../util/Util.js';
import { CommandInteraction } from './CommandInteraction.js';
import { CommandInteractionOptionResolver } from './CommandInteractionOptionResolver.js';

/**
 * Represents a command interaction.
 *
 * @extends {CommandInteraction}
 */
export class ChatInputCommandInteraction extends CommandInteraction {
	public options: CommandInteractionOptionResolver;
	constructor(client: Client, data: APIApplicationCommandInteraction) {
		super(client, data);

		/**
		 * The options passed to the command.
		 *
		 * @type {CommandInteractionOptionResolver}
		 */
		this.options = new CommandInteractionOptionResolver(
			this.client,
			(data.data as APIChatInputApplicationCommandInteractionData).options?.map((option: unknown) =>
				this.transformOption(option, (data.data as APIChatInputApplicationCommandInteractionData).resolved),
			) ?? [],
			transformResolved(
				{ client: this.client, guild: this.guild, channel: this.channel },
				(data.data as APIChatInputApplicationCommandInteractionData).resolved,
			),
		);
	}

	/**
	 * Returns a string representation of the command interaction.
	 * This can then be copied by a user and executed again in a new command while keeping the option order.
	 *
	 * @returns {string}
	 */
	toString() {
		const properties = [
			this.commandName,
			this.options._group,
			this.options._subcommand,
			// @ts-expect-error
			...this.options._hoistedOptions.map((option) => `${option.name}:${option.value}`),
		];
		return `/${properties.filter(Boolean).join(' ')}`;
	}
}
