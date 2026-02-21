import type { Client } from '../../Client.js';
import type { GatewayMessageReactionAddDispatch } from 'discord-api-types/v10';
export default (client: Client, packet: GatewayMessageReactionAddDispatch) => {
  client.actions.MessageReactionAdd.handle(packet.d);
};
