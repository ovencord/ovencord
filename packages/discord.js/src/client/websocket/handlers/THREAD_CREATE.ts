import type { Client } from '../../Client.js';
import type { GatewayDispatchPayload } from 'discord-api-types/v10';

export default (client: Client, packet: GatewayDispatchPayload) => {
  client.actions.ThreadCreate.handle(packet.d);
};
