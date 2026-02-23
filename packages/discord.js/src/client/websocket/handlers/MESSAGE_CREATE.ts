import type { GatewayMessageCreateDispatch } from 'discord-api-types/v10';
import type { Client } from '../../Client.js';
export default (client: Client, packet: GatewayMessageCreateDispatch) => {
	client.actions.MessageCreate.handle(packet.d);
};
