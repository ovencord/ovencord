import { Collection } from '@ovencord/collection';
import type { APIGuildOnboardingPromptOption, APIPartialEmoji, Snowflake } from 'discord-api-types/v10';
import { Base } from './Base.js';
import { Emoji } from './Emoji.js';

/**
 * Represents the data of an option from a prompt of a guilds onboarding.
 *
 * @extends {Base}
 */
export class GuildOnboardingPromptOption extends Base {
	public guildId: Snowflake;
	public id: Snowflake;
	public channels: Collection<Snowflake, any>;
	public roles: Collection<Snowflake, any>;
	public _emoji: APIPartialEmoji;
	public title: string;
	public description: string | null;
	constructor(client: any, data: APIGuildOnboardingPromptOption, guildId: Snowflake) {
		super(client);

		/**
		 * The id of the guild this onboarding prompt option is from
		 *
		 * @type {Snowflake}
		 */
		this.guildId = guildId;

		const guild = this.guild;

		/**
		 * The id of the option
		 *
		 * @type {Snowflake}
		 */
		this.id = data.id;

		/**
		 * The channels a member is added to when the option is selected
		 *
		 * @type {Collection<Snowflake, GuildChannel>}
		 */
		this.channels = data.channel_ids.reduce(
			(channels: Collection<Snowflake, any>, channelId) =>
				channels.set(channelId, guild?.channels?.cache?.get(channelId)),
			new Collection<Snowflake, any>(),
		);

		/**
		 * The roles assigned to a member when the option is selected
		 *
		 * @type {Collection<Snowflake, Role>}
		 */
		this.roles = data.role_ids.reduce(
			(roles: Collection<Snowflake, any>, roleId) => roles.set(roleId, guild?.roles?.cache?.get(roleId)),
			new Collection<Snowflake, any>(),
		);

		/**
		 * The raw emoji of the option
		 *
		 * @type {APIPartialEmoji}
		 * @private
		 */
		this._emoji = data.emoji;

		/**
		 * The title of the option
		 *
		 * @type {string}
		 */
		this.title = data.title;

		/**
		 * The description of the option
		 *
		 * @type {?string}
		 */
		this.description = data.description;
	}

	/**
	 * The guild this onboarding prompt option is from
	 *
	 * @type {Guild}
	 * @readonly
	 */
	get guild() {
		return this.client.guilds.cache.get(this.guildId);
	}

	/**
	 * The emoji of this onboarding prompt option
	 *
	 * @type {?(GuildEmoji|Emoji)}
	 */
	get emoji() {
		if (!this._emoji?.id && !this._emoji?.name) return null;
		return (
			(this._emoji.id ? this.guild?.emojis?.cache?.get(this._emoji.id) : null) ?? new Emoji(this.client, this._emoji)
		);
	}
}
