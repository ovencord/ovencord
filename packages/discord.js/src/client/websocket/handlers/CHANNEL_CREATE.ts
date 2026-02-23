import type { GatewayChannelCreateDispatch } from 'discord-api-types/v10';
import type { Client } from '../../Client.js';
export default (client: Client, packet: GatewayChannelCreateDispatch) => {
	client.actions.ChannelCreate.handle(packet.d);
};
