import type { Client } from '../../Client.js';
import type { GatewayMessagePollVoteAddDispatch } from 'discord-api-types/v10';
export default (client: Client, packet: GatewayMessagePollVoteAddDispatch) => {
  client.actions.MessagePollVoteAdd.handle(packet.d);
};
