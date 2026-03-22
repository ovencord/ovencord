import type { APISticker } from 'discord-api-types/v10';
import type { Guild } from '../../structures/Guild.js';
import { Events } from '../../util/Events.js';
import { Action } from './Action.js';

export class GuildStickerCreateAction extends Action {
	override handle(guild: Guild, createdSticker: APISticker) {
		const already = guild.stickers.cache.has(createdSticker.id);
		const sticker = guild.stickers._add(createdSticker, true);
		/**
		 * Emitted whenever a custom sticker is created in a guild.
		 *
		 * @event Client#stickerCreate
		 * @param {Sticker} sticker The sticker that was created
		 */
		if (!already) this.client.emit(Events.GuildStickerCreate, sticker);
		return { sticker };
	}
}
