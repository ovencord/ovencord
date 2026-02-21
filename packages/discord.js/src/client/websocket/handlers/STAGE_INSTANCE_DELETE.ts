import type { Client } from '../../Client.js';
import type { GatewayStageInstanceDeleteDispatch } from 'discord-api-types/v10';
export default (client: Client, packet: GatewayStageInstanceDeleteDispatch) => {
  client.actions.StageInstanceDelete.handle(packet.d);
};
