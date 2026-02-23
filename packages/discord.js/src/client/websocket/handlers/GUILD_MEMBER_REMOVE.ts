import type { GatewayGuildMemberRemoveDispatch } from 'discord-api-types/v10';
import type { Client } from '../../Client.js';
export default (client: Client, packet: GatewayGuildMemberRemoveDispatch) => {
	client.actions.GuildMemberRemove.handle(packet.d);
};
