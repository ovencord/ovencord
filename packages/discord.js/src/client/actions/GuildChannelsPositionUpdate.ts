import { Action } from './Action.js';

interface GuildChannelsPositionUpdateData {
	guild_id: string;
	channels: { id: string; position: number }[];
}

export class GuildChannelsPositionUpdateAction extends Action {
	override handle(data: GuildChannelsPositionUpdateData) {
		const client = this.client;

		const guild = client.guilds.cache.get(data.guild_id);
		if (guild) {
			for (const partialChannel of data.channels) {
				const channel = guild.channels.cache.get(partialChannel.id);
				if (channel) channel.rawPosition = partialChannel.position;
			}
		}

		return { guild };
	}
}
