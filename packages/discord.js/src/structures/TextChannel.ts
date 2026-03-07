import type { APITextChannel } from 'discord-api-types/v10';
import { BaseGuildTextChannel } from './BaseGuildTextChannel.js';

/**
 * Represents a guild text channel on Discord.
 *
 * @extends {BaseGuildTextChannel}
 */
export class TextChannel extends BaseGuildTextChannel {
	public rateLimitPerUser: number | null | undefined;
	_patch(data: Partial<APITextChannel>) {
		super._patch(data);

		if ('rate_limit_per_user' in data) {
			/**
			 * The rate limit per user (slowmode) for this channel in seconds
			 *
			 * @type {number}
			 */
			this.rateLimitPerUser = data.rate_limit_per_user;
		}
	}

	/**
	 * Sets the rate limit per user (slowmode) for this channel.
	 *
	 * @param {number} rateLimitPerUser The new rate limit in seconds
	 * @param {string} [reason] Reason for changing the channel's rate limit
	 * @returns {Promise<TextChannel>}
	 */
	// @ts-expect-error
	async setRateLimitPerUser(rateLimitPerUser: number | null, reason?: string): Promise<TextChannel> {
		return this.edit({ rateLimitPerUser, reason }) as unknown as Promise<TextChannel>;
	}
}
