import type { Client } from '../../Client.js';
import type { GatewayInteractionCreateDispatch } from 'discord-api-types/v10';
export default (client: Client, packet: GatewayInteractionCreateDispatch) => {
  client.actions.InteractionCreate.handle(packet.d);
};
