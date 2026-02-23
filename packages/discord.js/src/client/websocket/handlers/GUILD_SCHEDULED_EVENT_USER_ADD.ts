import type { GatewayGuildScheduledEventUserAddDispatch } from 'discord-api-types/v10';
import type { Client } from '../../Client.js';
export default (client: Client, packet: GatewayGuildScheduledEventUserAddDispatch) => {
	client.actions.GuildScheduledEventUserAdd.handle(packet.d);
};
