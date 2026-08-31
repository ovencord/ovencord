import { CloseCodes, WebSocketShardEvents } from '@ovencord/ws';
import type { Client as DiscordClient } from '../Client.js';

interface VoiceAdapter {
	onVoiceServerUpdate(data: unknown): void;
	onVoiceStateUpdate(data: unknown): void;
	destroy(): void;
}

/**
 * Manages voice connections for the client
 */
export class ClientVoiceManager {
	public adapters: Map<string, VoiceAdapter>;
	public client: DiscordClient;
	constructor(client: DiscordClient) {
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

	onVoiceServer(payload: { guild_id: string }) {
		this.adapters.get(payload.guild_id)?.onVoiceServerUpdate(payload);
	}

	onVoiceStateUpdate(payload: { guild_id?: string; session_id?: string; user_id: string }) {
		if (payload.guild_id && payload.session_id && payload.user_id === this.client.user?.id) {
			this.adapters.get(payload.guild_id)?.onVoiceStateUpdate(payload);
		}
	}
}
