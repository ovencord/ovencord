import type { Client } from '../../Client.js';
import type { GatewayChannelCreateDispatch } from 'discord-api-types/v10';
export default (client: Client, packet: GatewayChannelCreateDispatch) => {
  client.actions.ChannelCreate.handle(packet.d);
};
