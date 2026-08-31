import type { APIGuildWelcomeScreenChannel, Snowflake } from 'discord-api-types/v10';
import { Base } from './Base.js';
import { Emoji } from './Emoji.js';
import type { Guild } from './Guild.js';
import type { InviteGuild } from './InviteGuild.js';

/**
 * Represents a channel link in a guild's welcome screen.
 *
 * @extends {Base}
 */
export class WelcomeChannel extends Base {
	public guild: Guild | InviteGuild;
	public description: string;
	public _emoji: { name: string | null; id: Snowflake | null };
	public channelId: Snowflake;
	constructor(guild: Guild | InviteGuild, data: APIGuildWelcomeScreenChannel) {
		super(guild.client);

		/**
		 * The guild for this welcome channel
		 *
		 * @type {Guild|InviteGuild}
		 */
		this.guild = guild;

		/**
		 * The description of this welcome channel
		 *
		 * @type {string}
		 */
		this.description = data.description as string;

		/**
		 * The raw emoji data
		 *
		 * @type {Object}
		 * @private
		 */
		this._emoji = {
			name: data.emoji_name,
			id: data.emoji_id,
		};

		/**
		 * The id of this welcome channel
		 *
		 * @type {Snowflake}
		 */
		this.channelId = data.channel_id as Snowflake;
	}

	/**
	 * The channel of this welcome channel
	 *
	 * @type {?(TextChannel|AnnouncementChannel|ForumChannel|MediaChannel)}
	 */
	get channel() {
		return this.client.channels.resolve(this.channelId);
	}

	/**
	 * The emoji of this welcome channel
	 *
	 * @type {GuildEmoji|Emoji}
	 */
	get emoji() {
		return (
			('emojis' in this.guild ? this.guild.emojis.cache.get(this._emoji.id) : null) ??
			new Emoji(this.client, {
				name: this._emoji.name,
				id: this._emoji.id,
			} as import('discord-api-types/v10').APIEmoji)
		);
	}
}
