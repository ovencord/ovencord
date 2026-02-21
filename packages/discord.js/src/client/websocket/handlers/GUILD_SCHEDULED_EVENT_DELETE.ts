import type { Client } from '../../Client.js';
import type { GatewayGuildScheduledEventDeleteDispatch } from 'discord-api-types/v10';
export default (client: Client, packet: GatewayGuildScheduledEventDeleteDispatch) => {
  client.actions.GuildScheduledEventDelete.handle(packet.d);
};
