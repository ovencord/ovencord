import { Collection } from '@ovencord/collection';
import type { APIInteractionDataResolved, APIMessageComponentInteraction, Snowflake } from 'discord-api-types/v10';
import type { Client } from '../client/Client.js';
import { Events } from '../util/Events.js';
import type { GuildMember } from './GuildMember.js';
import { MessageComponentInteraction } from './MessageComponentInteraction.js';
import type { User } from './User.js';

/**
 * Represents a {@link ComponentType.UserSelect} select menu interaction.
 *
 * @extends {MessageComponentInteraction}
 */
export class UserSelectMenuInteraction extends MessageComponentInteraction {
	public users: Collection<Snowflake, User>;
	public members: Collection<Snowflake, GuildMember | any>;
	public values: Snowflake[];
	constructor(client: Client, data: APIMessageComponentInteraction) {
		super(client, data);
		const dataData = data.data as any;
		const resolved = dataData.resolved as APIInteractionDataResolved | undefined;
		const values = dataData.values as Snowflake[] | undefined;

		/**
		 * An array of the selected user ids
		 *
		 * @type {Snowflake[]}
		 */
		this.values = values ?? [];

		/**
		 * Collection of the selected users
		 *
		 * @type {Collection<Snowflake, User>}
		 */
		this.users = new Collection();

		/**
		 * Collection of the selected members
		 *
		 * @type {Collection<Snowflake, GuildMember|APIGuildMember>}
		 */
		this.members = new Collection();

		if (resolved?.users) {
			for (const user of Object.values(resolved.users)) {
				this.users.set(user.id as Snowflake, this.client.users._add(user));
			}
		}

		if (resolved?.members) {
			for (const [id, member] of Object.entries(resolved.members)) {
				const user = resolved.users?.[id];

				if (!user) {
					this.client.emit(
						Events.Debug,
						`[UserSelectMenuInteraction] Received a member without a user, skipping ${id}`,
					);
					continue;
				}

				this.members.set(
					id as Snowflake,
					this.guild?.members._add({ user, ...member } as any) ?? ({ user, ...member } as any),
				);
			}
		}
	}
}
