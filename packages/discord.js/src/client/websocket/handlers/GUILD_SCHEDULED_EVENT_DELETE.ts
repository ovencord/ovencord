import type { GatewayGuildScheduledEventDeleteDispatch } from 'discord-api-types/v10';
import type { Client } from '../../Client.js';
export default (client: Client, packet: GatewayGuildScheduledEventDeleteDispatch) => {
	client.actions.GuildScheduledEventDelete.handle(packet.d);
};
