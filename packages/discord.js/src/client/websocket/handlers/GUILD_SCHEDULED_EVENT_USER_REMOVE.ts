import type { GatewayGuildScheduledEventUserRemoveDispatch } from 'discord-api-types/v10';
import type { Client } from '../../Client.js';
export default (client: Client, packet: GatewayGuildScheduledEventUserRemoveDispatch) => {
	client.actions.GuildScheduledEventUserRemove.handle(packet.d);
};
