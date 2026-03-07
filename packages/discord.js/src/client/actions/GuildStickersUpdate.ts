import type { GatewayGuildStickersUpdateDispatchData } from 'discord-api-types/v10';
import type { Sticker } from '../../structures/Sticker.js';
import { Action } from './Action.js';

export class GuildStickersUpdateAction extends Action {
	override handle(data: GatewayGuildStickersUpdateDispatchData) {
		const guild = this.client.guilds.cache.get(data.guild_id);
		if (!guild?.stickers) return;

		const deletions = new Map<string, Sticker>(guild.stickers.cache);

		for (const sticker of data.stickers) {
			// Determine type of sticker event
			const cachedSticker = guild.stickers.cache.get(sticker.id);
			if (cachedSticker) {
				deletions.delete(sticker.id);
				if (!cachedSticker.equals(sticker as unknown as Sticker)) {
					// Sticker updated
					this.client.actions.GuildStickerUpdate.handle(cachedSticker, sticker as unknown as Sticker);
				}
			} else {
				// Sticker added
				this.client.actions.GuildStickerCreate.handle(guild, sticker);
			}
		}

		for (const sticker of deletions.values()) {
			// Sticker deleted
			this.client.actions.GuildStickerDelete.handle(sticker);
		}
	}
}
