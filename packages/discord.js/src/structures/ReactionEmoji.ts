import type { APIMessageComponentEmoji, APIPartialEmoji } from 'discord-api-types/v10';
import { flatten } from '../util/Util.js';
import { Emoji } from './Emoji.js';
import type { MessageReaction } from './MessageReaction.js';

/**
 * Represents a limited emoji set used for both custom and unicode emojis. Custom emojis
 * will use this class opposed to the Emoji class when the client doesn't know enough
 * information about them.
 *
 * @extends {Emoji}
 */
export class ReactionEmoji extends Emoji {
	public reaction: MessageReaction;
	constructor(reaction: MessageReaction, emoji: APIPartialEmoji | APIMessageComponentEmoji) {
		super(reaction.message.client, emoji);
		/**
		 * The message reaction this emoji refers to
		 *
		 * @type {MessageReaction}
		 */
		this.reaction = reaction;
	}

	toJSON() {
		return flatten(this, { identifier: true });
	}

	valueOf() {
		return this.id;
	}
}
