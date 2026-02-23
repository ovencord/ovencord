import type { GatewayMessageReactionRemoveEmojiDispatch } from 'discord-api-types/v10';
import type { Client } from '../../Client.js';
export default (client: Client, packet: GatewayMessageReactionRemoveEmojiDispatch) => {
	client.actions.MessageReactionRemoveEmoji.handle(packet.d);
};
