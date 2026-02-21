import type { Client } from '../../Client.js';
import type { GatewayThreadCreateDispatch } from 'discord-api-types/v10';
export default (client: Client, packet: GatewayThreadCreateDispatch) => {
  client.actions.ThreadCreate.handle(packet.d);
};
