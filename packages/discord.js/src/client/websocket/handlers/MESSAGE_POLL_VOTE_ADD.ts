import type { GatewayMessagePollVoteAddDispatch } from 'discord-api-types/v10';
import type { Client } from '../../Client.js';
export default (client: Client, packet: GatewayMessagePollVoteAddDispatch) => {
	client.actions.MessagePollVoteAdd.handle(packet.d);
};
