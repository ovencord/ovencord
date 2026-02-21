import type { Client } from '../../Client.js';
import type { GatewayGuildScheduledEventUserAddDispatch } from 'discord-api-types/v10';
export default (client: Client, packet: GatewayGuildScheduledEventUserAddDispatch) => {
  client.actions.GuildScheduledEventUserAdd.handle(packet.d);
};
