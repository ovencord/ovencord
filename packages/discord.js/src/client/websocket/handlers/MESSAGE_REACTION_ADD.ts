import type { GatewayMessageReactionAddDispatch } from 'discord-api-types/v10';
import type { Client } from '../../Client.js';
export default (client: Client, packet: GatewayMessageReactionAddDispatch) => {
	client.actions.MessageReactionAdd.handle(packet.d);
};
