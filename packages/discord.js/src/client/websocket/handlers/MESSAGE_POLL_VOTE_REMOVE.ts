import type { Client } from '../../Client.js';
import type { GatewayMessagePollVoteRemoveDispatch } from 'discord-api-types/v10';
export default (client: Client, packet: GatewayMessagePollVoteRemoveDispatch) => {
  client.actions.MessagePollVoteRemove.handle(packet.d);
};
