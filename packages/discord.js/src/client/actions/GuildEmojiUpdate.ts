import type { GuildEmoji } from '../../structures/GuildEmoji.js';
import { Events } from '../../util/Events.js';
import { Action } from './Action.js';

export class GuildEmojiUpdateAction extends Action {
	override handle(current: GuildEmoji, data: GuildEmoji) {
		const old = current._update(data);
		/**
		 * Emitted whenever a custom emoji is updated in a guild.
		 *
		 * @event Client#emojiUpdate
		 * @param {GuildEmoji} oldEmoji The old emoji
		 * @param {GuildEmoji} newEmoji The new emoji
		 */
		this.client.emit(Events.GuildEmojiUpdate, old, current);
		return { emoji: current };
	}
}
