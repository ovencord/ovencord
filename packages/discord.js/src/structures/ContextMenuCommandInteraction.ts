import { lazy } from '@ovencord/util';
import {
	type APIApplicationCommandInteraction,
	type APIApplicationCommandInteractionData,
	ApplicationCommandOptionType,
	type Snowflake,
} from 'discord-api-types/v10';
import type { Client } from '../client/Client.js';
import { transformResolved } from '../util/Util.js';
import { CommandInteraction, type CommandInteractionOption } from './CommandInteraction.js';
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

		const dataPayload = data.data as APIApplicationCommandInteractionData;
		this.options = new CommandInteractionOptionResolver(
			this.client,
			this.resolveContextMenuOptions(dataPayload),
			transformResolved(
				{ client: this.client, guild: this.guild, channel: this.channel },
				(dataPayload as any).resolved,
			),
		);

		this.targetId = (dataPayload as any).target_id;
	}

	/**
	 * Resolves and transforms options received from the API for a context menu interaction.
	 *
	 * @param {APIApplicationCommandInteractionData} data The interaction data
	 * @returns {CommandInteractionOption[]}
	 * @private
	 */
	resolveContextMenuOptions(data: APIApplicationCommandInteractionData): CommandInteractionOption[] {
		const target_id = (data as any).target_id as Snowflake;
		const resolved = (data as any).resolved;
		if (!resolved) return [];

		const result: CommandInteractionOption[] = [];

		if (resolved.users?.[target_id]) {
			result.push(
				this.transformOption(
					{ name: 'user', type: ApplicationCommandOptionType.User, value: target_id } as any,
					resolved as any,
				),
			);
		}

		if (resolved.messages?.[target_id]) {
			result.push({
				name: 'message',
				type: '_MESSAGE' as any,
				value: target_id,
				message:
					this.channel?.messages._add(resolved.messages[target_id] as any) ??
					new (getMessage())(this.client, resolved.messages[target_id] as any),
			} as any);
		}

		return result;
	}
}
