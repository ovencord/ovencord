import type { APIChannel, ForumLayoutType } from 'discord-api-types/v10';
import { ThreadOnlyChannel } from './ThreadOnlyChannel.js';

/**
 * Represents a forum channel.
 *
 * @extends {ThreadOnlyChannel}
 */
export class ForumChannel extends ThreadOnlyChannel {
	public defaultForumLayout: ForumLayoutType | null | undefined;
	_patch(data: Partial<APIChannel>) {
		super._patch(data);

		/**
		 * The default layout type used to display posts
		 *
		 * @type {ForumLayoutType}
		 */
		this.defaultForumLayout = (
			data as unknown as { default_forum_layout?: ForumLayoutType | null }
		).default_forum_layout;
	}

	/**
	 * Sets the default forum layout type used to display posts
	 *
	 * @param {ForumLayoutType} defaultForumLayout The default forum layout type to set on this channel
	 * @param {string} [reason] Reason for changing the default forum layout
	 * @returns {Promise<ForumChannel>}
	 */
	async setDefaultForumLayout(defaultForumLayout: ForumLayoutType, reason?: string) {
		return this.edit({ defaultForumLayout, reason });
	}
}
