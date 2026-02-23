import type { GatewayStageInstanceDeleteDispatch } from 'discord-api-types/v10';
import type { Client } from '../../Client.js';
export default (client: Client, packet: GatewayStageInstanceDeleteDispatch) => {
	client.actions.StageInstanceDelete.handle(packet.d);
};
