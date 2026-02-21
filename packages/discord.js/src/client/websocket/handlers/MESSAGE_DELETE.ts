import type { Client } from '../../Client.js';
import type { GatewayMessageDeleteDispatch } from 'discord-api-types/v10';
export default (client: Client, packet: GatewayMessageDeleteDispatch) => {
  client.actions.MessageDelete.handle(packet.d);
};
