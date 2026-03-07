import type { GatewayGuildRoleCreateDispatchData } from 'discord-api-types/v10';
import type { Role } from '../../structures/Role.js';
import { Events } from '../../util/Events.js';
import { Action } from './Action.js';

export class GuildRoleCreateAction extends Action {
	override handle(data: GatewayGuildRoleCreateDispatchData) {
		const client = this.client;
		const guild = client.guilds.cache.get(data.guild_id);
		let role: Role | undefined;
		if (guild) {
			const already = guild.roles.cache.has(data.role.id);
			role = guild.roles._add(data.role);
			/**
			 * Emitted whenever a role is created.
			 *
			 * @event Client#roleCreate
			 * @param {Role} role The role that was created
			 */
			if (!already) client.emit(Events.GuildRoleCreate, role);
		}

		return { role };
	}
}
