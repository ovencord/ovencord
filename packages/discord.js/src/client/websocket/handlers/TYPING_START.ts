import type { Client } from '../../Client.js';
import type { GatewayTypingStartDispatch } from 'discord-api-types/v10';
export default (client: Client, packet: GatewayTypingStartDispatch) => {
  client.actions.TypingStart.handle(packet.d);
};
