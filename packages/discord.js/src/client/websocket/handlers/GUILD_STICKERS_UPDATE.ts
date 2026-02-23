import type { GatewayGuildStickersUpdateDispatch } from 'discord-api-types/v10';
import type { Client } from '../../Client.js';
export default (client: Client, packet: GatewayGuildStickersUpdateDispatch) => {
	client.actions.GuildStickersUpdate.handle(packet.d);
};
