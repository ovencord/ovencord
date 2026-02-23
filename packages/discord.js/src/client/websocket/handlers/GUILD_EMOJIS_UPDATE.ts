import type { GatewayGuildEmojisUpdateDispatch } from 'discord-api-types/v10';
import type { Client } from '../../Client.js';
export default (client: Client, packet: GatewayGuildEmojisUpdateDispatch) => {
	client.actions.GuildEmojisUpdate.handle(packet.d);
};
