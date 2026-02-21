import type { Client } from '../../Client.js';
import type { GatewayStageInstanceUpdateDispatch } from 'discord-api-types/v10';
export default (client: Client, packet: GatewayStageInstanceUpdateDispatch) => {
  client.actions.StageInstanceUpdate.handle(packet.d);
};
