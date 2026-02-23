import type { GatewayMessageDeleteBulkDispatch } from 'discord-api-types/v10';
import type { Client } from '../../Client.js';
export default (client: Client, packet: GatewayMessageDeleteBulkDispatch) => {
	client.actions.MessageDeleteBulk.handle(packet.d);
};
