import { Action } from './Action.js';

interface GuildRolesPositionUpdateData {
	guild_id: string;
	roles: { id: string; position: number | null }[];
}

export class GuildRolesPositionUpdateAction extends Action {
	override handle(data: GuildRolesPositionUpdateData) {
		const client = this.client;

		const guild = client.guilds.cache.get(data.guild_id);
		if (guild) {
			for (const partialRole of data.roles) {
				const role = guild.roles.cache.get(partialRole.id);
				if (role) role.rawPosition = partialRole.position;
			}
		}

		return { guild };
	}
}
