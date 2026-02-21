import type { Client } from '../../Client.js';
import type { GatewayMessageReactionRemoveEmojiDispatch } from 'discord-api-types/v10';
export default (client: Client, packet: GatewayMessageReactionRemoveEmojiDispatch) => {
  client.actions.MessageReactionRemoveEmoji.handle(packet.d);
};
