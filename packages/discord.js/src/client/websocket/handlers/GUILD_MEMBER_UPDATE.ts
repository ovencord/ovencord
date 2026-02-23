import type { GatewayGuildMemberUpdateDispatch } from 'discord-api-types/v10';
import type { Client } from '../../Client.js';
export default (client: Client, packet: GatewayGuildMemberUpdateDispatch) => {
	client.actions.GuildMemberUpdate.handle(packet.d);
};
