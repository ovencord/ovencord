import type { Client } from '../../Client.js';
import type { GatewayGuildSoundboardSoundDeleteDispatch } from 'discord-api-types/v10';
export default (client: Client, { d: data }: GatewayGuildSoundboardSoundDeleteDispatch) => {
  client.actions.GuildSoundboardSoundDelete.handle(data);
};
