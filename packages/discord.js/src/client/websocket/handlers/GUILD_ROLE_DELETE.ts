import type { Client } from '../../Client.js';
import type { GatewayGuildRoleDeleteDispatch } from 'discord-api-types/v10';
export default (client: Client, packet: GatewayGuildRoleDeleteDispatch) => {
  client.actions.GuildRoleDelete.handle(packet.d);
};
