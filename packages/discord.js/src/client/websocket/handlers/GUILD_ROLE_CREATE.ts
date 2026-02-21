import type { Client } from '../../Client.js';
import type { GatewayGuildRoleCreateDispatch } from 'discord-api-types/v10';
export default (client: Client, packet: GatewayGuildRoleCreateDispatch) => {
  client.actions.GuildRoleCreate.handle(packet.d);
};
