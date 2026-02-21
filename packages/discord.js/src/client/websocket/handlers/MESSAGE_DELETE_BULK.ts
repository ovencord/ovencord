import type { Client } from '../../Client.js';
import type { GatewayMessageDeleteBulkDispatch } from 'discord-api-types/v10';
export default (client: Client, packet: GatewayMessageDeleteBulkDispatch) => {
  client.actions.MessageDeleteBulk.handle(packet.d);
};
