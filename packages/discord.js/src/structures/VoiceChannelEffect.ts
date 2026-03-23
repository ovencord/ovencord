import type { Snowflake } from 'discord-api-types/v10';
import { Emoji } from './Emoji.js';
import type { Guild } from './Guild.js';

/**
 * Represents an effect used in a {@link VoiceChannel}.
 */
export class VoiceChannelEffect {
	public guild: Guild;
	public channelId: Snowflake;
	public userId: Snowflake;
	public emoji: Emoji | null;
	public animationType: number | null;
	public animationId: number | null;
	public soundId: Snowflake | number | null;
	public soundVolume: number | null;
	constructor(data: Record<string, unknown>, guild: Guild) {
		/**
		 * The guild where the effect was sent from.
		 *
		 * @type {Guild}
		 */
		this.guild = guild;

		/**
		 * The id of the channel the effect was sent in.
		 *
		 * @type {Snowflake}
		 */
		this.channelId = data.channel_id as Snowflake;

		/**
		 * The id of the user that sent the effect.
		 *
		 * @type {Snowflake}
		 */
		this.userId = data.user_id as Snowflake;

		/**
		 * The emoji of the effect.
		 *
		 * @type {?Emoji}
		 */
		this.emoji = data.emoji ? new Emoji(guild.client, data.emoji as any) : null;

		/**
		 * The animation type of the effect.
		 *
		 * @type {?VoiceChannelEffectSendAnimationType}
		 */
		this.animationType = (data.animation_type as number) ?? null;

		/**
		 * The animation id of the effect.
		 *
		 * @type {?number}
		 */
		this.animationId = (data.animation_id as number) ?? null;

		/**
		 * The id of the soundboard sound for soundboard effects.
		 *
		 * @type {?(Snowflake|number)}
		 */
		this.soundId = (data.sound_id as Snowflake | number) ?? null;

		/**
		 * The volume of the soundboard sound [0-1] for soundboard effects.
		 *
		 * @type {?number}
		 */
		this.soundVolume = (data.sound_volume as number) ?? null;
	}

	/**
	 * The channel the effect was sent in.
	 *
	 * @type {?VoiceChannel}
	 * @readonly
	 */
	get channel() {
		return this.guild.channels.cache.get(this.channelId) ?? null;
	}

	/**
	 * The soundboard sound for soundboard effects.
	 *
	 * @type {?SoundboardSound}
	 * @readonly
	 */
	get soundboardSound() {
		return this.guild.soundboardSounds.cache.get(this.soundId) ?? null;
	}
}
