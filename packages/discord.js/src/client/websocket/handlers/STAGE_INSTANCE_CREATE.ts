import type { GatewayStageInstanceCreateDispatch } from 'discord-api-types/v10';
import type { Client } from '../../Client.js';
export default (client: Client, packet: GatewayStageInstanceCreateDispatch) => {
	client.actions.StageInstanceCreate.handle(packet.d);
};
