import type { GatewayMessagePollVoteRemoveDispatch } from 'discord-api-types/v10';
import type { Client } from '../../Client.js';
export default (client: Client, packet: GatewayMessagePollVoteRemoveDispatch) => {
	client.actions.MessagePollVoteRemove.handle(packet.d);
};
