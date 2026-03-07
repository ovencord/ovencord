import { lazy } from '@ovencord/util';
import type {
	APIApplicationCommandInteraction,
	APIApplicationCommandInteractionData,
	Snowflake,
} from 'discord-api-types/v10';
import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import type { Client } from '../client/Client.js';
import { transformResolved } from '../util/Util.js';
import { CommandInteraction } from './CommandInteraction.js';
import { CommandInteractionOptionResolver } from './CommandInteractionOptionResolver.js';

const getMessage = lazy(() => require('./Message.js').Message);

/**
 * Represents a context menu interaction.
 *
 * @extends {CommandInteraction}
 */
export class ContextMenuCommandInteraction extends CommandInteraction {
	public options: CommandInteractionOptionResolver;
	public targetId: Snowflake;
	constructor(client: Client, data: APIApplicationCommandInteraction) {
		super(client, data);
		/**
		 * The target of the interaction, parsed into options
		 *
		 * @type {CommandInteractionOptionResolver}
		 */
		this.options = new CommandInteractionOptionResolver(
			this.client,
			this.resolveContextMenuOptions(data.data as any),
			transformResolved({ client: this.client, guild: this.guild, channel: this.channel }, (data.data as any).resolved),
		);

		/**
		 * The id of the target of this interaction
		 *
		 * @type {Snowflake}
		 */
		this.targetId = (data.data as any).target_id;
	}

	/**
	 * Resolves and transforms options received from the API for a context menu interaction.
	 *
	 * @param {APIApplicationCommandInteractionData} data The interaction data
	 * @returns {CommandInteractionOption[]}
	 * @private
	 */
	resolveContextMenuOptions({ target_id, resolved }: Record<string, any>) {
		const result = [];

		if (resolved.users?.[target_id]) {
			result.push(
				this.transformOption({ name: 'user', type: ApplicationCommandOptionType.User, value: target_id }, resolved),
			);
		}

		if (resolved.messages?.[target_id]) {
			result.push({
				name: 'message',
				type: '_MESSAGE',
				value: target_id,
				message:
					this.channel?.messages._add(resolved.messages[target_id]) ??
					new (getMessage())(this.client, resolved.messages[target_id]),
			});
		}

		return result;
	}
}
