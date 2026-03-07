import type { GatewayGuildEmojisUpdateDispatchData } from 'discord-api-types/v10';
import type { GuildEmoji } from '../../structures/GuildEmoji.js';
import { Action } from './Action.js';

export class GuildEmojisUpdateAction extends Action {
	override handle(data: GatewayGuildEmojisUpdateDispatchData) {
		const guild = this.client.guilds.cache.get(data.guild_id);
		if (!guild?.emojis) return;

		const deletions = new Map<string, GuildEmoji>(guild.emojis.cache);

		for (const emoji of data.emojis) {
			// Determine type of emoji event
			const cachedEmoji = guild.emojis.cache.get(emoji.id);
			if (cachedEmoji) {
				deletions.delete(emoji.id as string);
				if (!cachedEmoji.equals(emoji as unknown as GuildEmoji)) {
					// Emoji updated
					this.client.actions.GuildEmojiUpdate.handle(cachedEmoji, emoji as unknown as GuildEmoji);
				}
			} else {
				// Emoji added
				this.client.actions.GuildEmojiCreate.handle(guild, emoji);
			}
		}

		for (const emoji of deletions.values()) {
			// Emoji deleted
			this.client.actions.GuildEmojiDelete.handle(emoji);
		}
	}
}
