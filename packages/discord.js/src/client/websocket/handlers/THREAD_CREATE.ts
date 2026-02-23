import type { GatewayThreadCreateDispatch } from 'discord-api-types/v10';
import type { Client } from '../../Client.js';
export default (client: Client, packet: GatewayThreadCreateDispatch) => {
	client.actions.ThreadCreate.handle(packet.d);
};
