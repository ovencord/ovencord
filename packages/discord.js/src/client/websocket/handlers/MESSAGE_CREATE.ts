import type { Client } from '../../Client.js';
import type { GatewayMessageCreateDispatch } from 'discord-api-types/v10';
export default (client: Client, packet: GatewayMessageCreateDispatch) => {
  client.actions.MessageCreate.handle(packet.d);
};
