import type { Client } from '../../Client.js';
import type { GatewayDispatchPayload } from 'discord-api-types/v10';

export default (client: Client, { d: data }: GatewayDispatchPayload) => {
  client.actions.GuildSoundboardSoundDelete.handle(data);
};
