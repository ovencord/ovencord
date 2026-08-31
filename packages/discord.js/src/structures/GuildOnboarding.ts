import { Collection } from '@ovencord/collection';
import type { APIGuildOnboarding, GuildOnboardingMode, Snowflake } from 'discord-api-types/v10';
import { Base } from './Base.js';
import { GuildOnboardingPrompt } from './GuildOnboardingPrompt.js';

/**
 * Represents the onboarding data of a guild.
 *
 * @extends {Base}
 */
export class GuildOnboarding extends Base {
	public guildId: Snowflake;
	public prompts: Collection<Snowflake, GuildOnboardingPrompt>;
	public defaultChannels: Collection<Snowflake, any>;
	public enabled: boolean;
	public mode: GuildOnboardingMode;
	constructor(client: any, data: APIGuildOnboarding) {
		super(client);

		/**
		 * The id of the guild this onboarding data is for
		 *
		 * @type {Snowflake}
		 */
		this.guildId = data.guild_id;

		const guild = this.guild;

		/**
		 * The prompts shown during onboarding and in customize community
		 *
		 * @type {Collection<Snowflake, GuildOnboardingPrompt>}
		 */
		this.prompts = data.prompts.reduce(
			(prompts: Collection<Snowflake, GuildOnboardingPrompt>, prompt) =>
				prompts.set(prompt.id, new GuildOnboardingPrompt(client, prompt, this.guildId)),
			new Collection<Snowflake, GuildOnboardingPrompt>(),
		);

		/**
		 * The ids of the channels that new members get opted into automatically
		 *
		 * @type {Collection<Snowflake, GuildChannel>}
		 */
		this.defaultChannels = data.default_channel_ids.reduce(
			(channels: Collection<Snowflake, any>, channelId) =>
				channels.set(channelId, guild?.channels?.cache?.get(channelId)),
			new Collection<Snowflake, any>(),
		);

		/**
		 * Whether onboarding is enabled
		 *
		 * @type {boolean}
		 */
		this.enabled = data.enabled;

		/**
		 * The mode of this onboarding
		 *
		 * @type {GuildOnboardingMode}
		 */
		this.mode = data.mode;
	}

	/**
	 * The guild this onboarding is from
	 *
	 * @type {Guild}
	 * @readonly
	 */
	get guild() {
		return this.client.guilds.cache.get(this.guildId);
	}
}
