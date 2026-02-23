import type { GatewayMessageReactionRemoveAllDispatch } from 'discord-api-types/v10';
import type { Client } from '../../Client.js';
export default (client: Client, packet: GatewayMessageReactionRemoveAllDispatch) => {
	client.actions.MessageReactionRemoveAll.handle(packet.d);
};
