import type { Client } from '../../Client.js';
import type { GatewayThreadMembersUpdateDispatch } from 'discord-api-types/v10';
export default (client: Client, packet: GatewayThreadMembersUpdateDispatch) => {
  client.actions.ThreadMembersUpdate.handle(packet.d);
};
