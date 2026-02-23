import type { GatewayInteractionCreateDispatch } from 'discord-api-types/v10';
import type { Client } from '../../Client.js';
export default (client: Client, packet: GatewayInteractionCreateDispatch) => {
	client.actions.InteractionCreate.handle(packet.d);
};
