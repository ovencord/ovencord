import type { GatewayGuildSoundboardSoundDeleteDispatch } from 'discord-api-types/v10';
import type { Client } from '../../Client.js';
export default (client: Client, { d: data }: GatewayGuildSoundboardSoundDeleteDispatch) => {
	client.actions.GuildSoundboardSoundDelete.handle(data);
};
