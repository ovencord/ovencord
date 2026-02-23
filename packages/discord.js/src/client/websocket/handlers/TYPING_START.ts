import type { GatewayTypingStartDispatch } from 'discord-api-types/v10';
import type { Client } from '../../Client.js';
export default (client: Client, packet: GatewayTypingStartDispatch) => {
	client.actions.TypingStart.handle(packet.d);
};
