import type { GatewayMessageDeleteDispatch } from 'discord-api-types/v10';
import type { Client } from '../../Client.js';
export default (client: Client, packet: GatewayMessageDeleteDispatch) => {
	client.actions.MessageDelete.handle(packet.d);
};
