import type { Client } from '../../Client.js';
import type { GatewayUserUpdateDispatch } from 'discord-api-types/v10';
export default (client: Client, packet: GatewayUserUpdateDispatch) => {
  client.actions.UserUpdate.handle(packet.d);
};
