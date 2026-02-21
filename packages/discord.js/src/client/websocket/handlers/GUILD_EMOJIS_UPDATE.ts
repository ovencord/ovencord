import type { Client } from '../../Client.js';
import type { GatewayGuildEmojisUpdateDispatch } from 'discord-api-types/v10';
export default (client: Client, packet: GatewayGuildEmojisUpdateDispatch) => {
  client.actions.GuildEmojisUpdate.handle(packet.d);
};
