import { CloseCodes, WebSocketShardEvents } from '@ovencord/ws';
import type {
	GatewayVoiceServerUpdateDispatchData,
	GatewayVoiceStateUpdateDispatchData,
	Snowflake,
} from 'discord-api-types/v10';
import type { Client } from '../Client.js';

/**
 * Manages voice connections for the client
 */
export class ClientVoiceManager {
	// biome-ignore lint/suspicious/noExplicitAny: voice adapter structure is dynamic/managed by @ovencord/voice
	public adapters: Map<Snowflake, any>;
	public client!: Client;
	constructor(client: Client) {
		/**
		 * The client that instantiated this voice manager
		 *
		 * @type {Client}
		 * @readonly
		 * @name ClientVoiceManager#client
		 */
		Object.defineProperty(this, 'client', { value: client });

		/**
		 * Maps guild ids to voice adapters created for use with `@ovencord/voice`.
		 *
		 * @type {Map<Snowflake, Object>}
		 */
		this.adapters = new Map();

		client.ws.on(WebSocketShardEvents.Closed, (code: number, shardId: number) => {
			if (code === CloseCodes.Normal) {
				for (const [guildId, adapter] of this.adapters.entries()) {
					if (client.guilds.cache.get(guildId)?.shardId === shardId) {
						adapter.destroy();
					}
				}
			}
		});
	}

	onVoiceServer(payload: GatewayVoiceServerUpdateDispatchData) {
		this.adapters.get(payload.guild_id)?.onVoiceServerUpdate(payload);
	}

	onVoiceStateUpdate(payload: GatewayVoiceStateUpdateDispatchData) {
		if (payload.guild_id && payload.session_id && payload.user_id === this.client.user?.id) {
			this.adapters.get(payload.guild_id)?.onVoiceStateUpdate(payload);
		}
	}
}
