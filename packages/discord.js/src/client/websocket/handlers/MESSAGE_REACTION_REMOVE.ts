import type { Client } from '../../Client.js';
import type { GatewayMessageReactionRemoveDispatch } from 'discord-api-types/v10';
export default (client: Client, packet: GatewayMessageReactionRemoveDispatch) => {
  client.actions.MessageReactionRemove.handle(packet.d);
};
