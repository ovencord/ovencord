import { Collection } from '@ovencord/collection';
import type { APIChannel, APIMessageComponentInteraction, Snowflake } from 'discord-api-types/v10';
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
	constructor(client: Client, data: APIMessageComponentInteraction) {
		super(client, data);
		const { resolved, values } = data.data as any;

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

		if (resolved?.channels) {
			for (const channel of Object.values(resolved.channels)) {
				this.channels.set(
					(channel as any).id as Snowflake,
					this.client.channels._add(channel as any, this.guild) ?? (channel as any),
				);
			}
		}
	}
}
