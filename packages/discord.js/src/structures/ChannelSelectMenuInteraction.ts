import { Collection } from '@ovencord/collection';
import type { APIChannel, APIMessageChannelSelectInteractionData, Snowflake } from 'discord-api-types/v10';
import type { Client } from '../client/Client.js';
import type { BaseChannel } from './BaseChannel.js';
import { MessageComponentInteraction } from './MessageComponentInteraction.js';

/**
 * Represents a {@link ComponentType.ChannelSelect} select menu interaction.
 *
 * @extends {MessageComponentInteraction}
 */
export class ChannelSelectMenuInteraction extends MessageComponentInteraction {
	public channels: Collection<Snowflake, BaseChannel | APIChannel>;
	public values: Snowflake[];
	constructor(client: Client, data: { data: APIMessageChannelSelectInteractionData } & Record<string, unknown>) {
		super(client, data);
		const { resolved, values } = data.data;

		/**
		 * An array of the selected channel ids
		 *
		 * @type {Snowflake[]}
		 */
		this.values = values ?? [];

		/**
		 * Collection of the selected channels
		 *
		 * @type {Collection<Snowflake, BaseChannel|APIChannel>}
		 */
		this.channels = new Collection();

		for (const channel of Object.values(resolved?.channels ?? {}) as APIChannel[]) {
			this.channels.set(channel.id, this.client.channels._add(channel, this.guild) ?? channel);
		}
	}
}
