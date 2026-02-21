import type { Client } from '../../Client.js';
import type { GatewayGuildScheduledEventUserRemoveDispatch } from 'discord-api-types/v10';
export default (client: Client, packet: GatewayGuildScheduledEventUserRemoveDispatch) => {
  client.actions.GuildScheduledEventUserRemove.handle(packet.d);
};
