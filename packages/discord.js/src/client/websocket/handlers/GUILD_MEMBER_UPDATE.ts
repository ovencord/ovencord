import type { Client } from '../../Client.js';
import type { GatewayGuildMemberUpdateDispatch } from 'discord-api-types/v10';
export default (client: Client, packet: GatewayGuildMemberUpdateDispatch) => {
  client.actions.GuildMemberUpdate.handle(packet.d);
};
