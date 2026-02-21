import type { Client } from '../../Client.js';
import type { GatewayMessageReactionRemoveAllDispatch } from 'discord-api-types/v10';
export default (client: Client, packet: GatewayMessageReactionRemoveAllDispatch) => {
  client.actions.MessageReactionRemoveAll.handle(packet.d);
};
