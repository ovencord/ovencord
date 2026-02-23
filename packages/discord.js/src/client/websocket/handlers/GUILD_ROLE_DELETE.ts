import type { GatewayGuildRoleDeleteDispatch } from 'discord-api-types/v10';
import type { Client } from '../../Client.js';
export default (client: Client, packet: GatewayGuildRoleDeleteDispatch) => {
	client.actions.GuildRoleDelete.handle(packet.d);
};
