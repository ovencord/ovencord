import type { Client } from '../../Client.js';
import type { GatewayGuildMemberRemoveDispatch } from 'discord-api-types/v10';
export default (client: Client, packet: GatewayGuildMemberRemoveDispatch) => {
  client.actions.GuildMemberRemove.handle(packet.d);
};
