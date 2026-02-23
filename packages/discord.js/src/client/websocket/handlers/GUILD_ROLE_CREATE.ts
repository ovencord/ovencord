import type { GatewayGuildRoleCreateDispatch } from 'discord-api-types/v10';
import type { Client } from '../../Client.js';
export default (client: Client, packet: GatewayGuildRoleCreateDispatch) => {
	client.actions.GuildRoleCreate.handle(packet.d);
};
