import type { GatewayMessageReactionRemoveDispatch } from 'discord-api-types/v10';
import type { Client } from '../../Client.js';
export default (client: Client, packet: GatewayMessageReactionRemoveDispatch) => {
	client.actions.MessageReactionRemove.handle(packet.d);
};
