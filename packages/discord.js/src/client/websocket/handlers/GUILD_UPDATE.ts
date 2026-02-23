import type { GatewayGuildUpdateDispatch } from 'discord-api-types/v10';
import type { Client } from '../../Client.js';
export default (client: Client, packet: GatewayGuildUpdateDispatch) => {
	client.actions.GuildUpdate.handle(packet.d);
};
