import type { Client } from '../../Client.js';
import type { GatewayGuildStickersUpdateDispatch } from 'discord-api-types/v10';
export default (client: Client, packet: GatewayGuildStickersUpdateDispatch) => {
  client.actions.GuildStickersUpdate.handle(packet.d);
};
