import type { GatewayThreadMembersUpdateDispatch } from 'discord-api-types/v10';
import type { Client } from '../../Client.js';
export default (client: Client, packet: GatewayThreadMembersUpdateDispatch) => {
	client.actions.ThreadMembersUpdate.handle(packet.d);
};
