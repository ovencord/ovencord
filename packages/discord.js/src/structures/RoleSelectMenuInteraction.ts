import { Collection } from '@ovencord/collection';
import type { APIMessageComponentInteraction, Snowflake } from 'discord-api-types/v10';
import type { Client } from '../client/Client.js';
import { MessageComponentInteraction } from './MessageComponentInteraction.js';
import type { Role } from './Role.js';

/**
 * Represents a {@link ComponentType.RoleSelect} select menu interaction.
 *
 * @extends {MessageComponentInteraction}
 */
export class RoleSelectMenuInteraction extends MessageComponentInteraction {
	public values: Snowflake[];
	public roles: Collection<Snowflake, Role | any>;
	constructor(client: Client, data: APIMessageComponentInteraction) {
		super(client, data);
		const { resolved, values } = data.data as any;

		/**
		 * An array of the selected role ids
		 *
		 * @type {Snowflake[]}
		 */
		this.values = values ?? [];

		/**
		 * Collection of the selected roles
		 *
		 * @type {Collection<Snowflake, Role|APIRole>}
		 */
		this.roles = new Collection();

		if (resolved?.roles) {
			for (const role of Object.values(resolved.roles)) {
				this.roles.set((role as any).id, this.guild?.roles._add(role as any) ?? role);
			}
		}
	}
}
