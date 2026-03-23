import { Collection } from '@ovencord/collection';
import type { APIMessageComponentInteraction, Snowflake } from 'discord-api-types/v10';
import type { Client } from '../client/Client.js';
import { Events } from '../util/Events.js';
import type { GuildMember } from './GuildMember.js';
import { MessageComponentInteraction } from './MessageComponentInteraction.js';
import type { Role } from './Role.js';
import type { User } from './User.js';

/**
 * Represents a {@link ComponentType.MentionableSelect} select menu interaction.
 *
 * @extends {MessageComponentInteraction}
 */
export class MentionableSelectMenuInteraction extends MessageComponentInteraction {
	public users: Collection<Snowflake, User>;
	public members: Collection<Snowflake, GuildMember | any>;
	public roles: Collection<Snowflake, Role | any>;
	public values: Snowflake[];
	constructor(client: Client, data: APIMessageComponentInteraction) {
		super(client, data);
		const { resolved, values } = data.data as any;
		const { members, users, roles } = resolved ?? {};

		/**
		 * An array of the selected user and role ids
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
		 * Collection of the selected users
		 *
		 * @type {Collection<Snowflake, GuildMember|APIGuildMember>}
		 */
		this.members = new Collection();

		/**
		 * Collection of the selected roles
		 *
		 * @type {Collection<Snowflake, Role|APIRole>}
		 */
		this.roles = new Collection();

		if (members) {
			for (const [id, member] of Object.entries(members)) {
				const user = users?.[id];
				if (!user) {
					this.client.emit(
						Events.Debug,
						`[MentionableSelectMenuInteraction] Received a member without a user, skipping ${id}`,
					);

					continue;
				}

				this.members.set(
					id as Snowflake,
					this.guild?.members._add({ user, ...(member as any) } as any) ?? ({ user, ...(member as any) } as any),
				);
			}
		}

		if (users) {
			for (const user of Object.values(users)) {
				this.users.set((user as any).id as Snowflake, this.client.users._add(user as any));
			}
		}

		if (roles) {
			for (const role of Object.values(roles)) {
				this.roles.set((role as any).id as Snowflake, this.guild?.roles._add(role as any) ?? role);
			}
		}
	}
}
