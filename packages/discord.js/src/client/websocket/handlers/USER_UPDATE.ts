import type { GatewayUserUpdateDispatch } from 'discord-api-types/v10';
import type { Client } from '../../Client.js';
export default (client: Client, packet: GatewayUserUpdateDispatch) => {
	client.actions.UserUpdate.handle(packet.d);
};
