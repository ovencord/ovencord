import type { GatewayChannelDeleteDispatch } from 'discord-api-types/v10';
import type { Client } from '../../Client.js';
export default (client: Client, packet: GatewayChannelDeleteDispatch) => {
	client.actions.ChannelDelete.handle(packet.d);
};
