import type { GatewayStageInstanceUpdateDispatch } from 'discord-api-types/v10';
import type { Client } from '../../Client.js';
export default (client: Client, packet: GatewayStageInstanceUpdateDispatch) => {
	client.actions.StageInstanceUpdate.handle(packet.d);
};
