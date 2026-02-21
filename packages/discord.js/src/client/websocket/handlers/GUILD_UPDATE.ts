import type { Client } from '../../Client.js';
import type { GatewayGuildUpdateDispatch } from 'discord-api-types/v10';
export default (client: Client, packet: GatewayGuildUpdateDispatch) => {
  client.actions.GuildUpdate.handle(packet.d);
};
