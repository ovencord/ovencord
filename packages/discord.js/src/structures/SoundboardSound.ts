import { DiscordSnowflake } from '@ovencord/util';
import type { APISoundboardSound, Snowflake } from 'discord-api-types/v10';
import type { Client } from '../client/Client.js';
import { DiscordjsError, ErrorCodes } from '../errors/index.js';
import { Base } from './Base.js';
import { Emoji } from './Emoji.js';
import type { User } from './User.js';

/**
 * Represents a soundboard sound.
 *
 * @extends {Base}
 */
export class SoundboardSound extends Base {
	public soundId: Snowflake;
	public available: boolean | null = null;
	public name: string | null = null;
	public volume: number | null = null;
	public _emoji: { id: Snowflake | null; name: string | null } | null = null;
	public guildId: Snowflake | null = null;
	public user: User | null = null;

	constructor(client: Client, data: APISoundboardSound) {
		super(client);
		this.soundId = data.sound_id;
		this._patch(data);
	}

	override _patch(data: Partial<APISoundboardSound>) {
		if ('available' in data) {
			this.available = data.available ?? null;
		}

		if ('name' in data) {
			this.name = data.name ?? null;
		}

		if ('volume' in data) {
			this.volume = data.volume ?? null;
		}

		if ('emoji_id' in data || 'emoji_name' in data) {
			this._emoji = {
				id: data.emoji_id ?? null,
				name: data.emoji_name ?? null,
			};
		}

		if ('guild_id' in data) {
			this.guildId = data.guild_id ?? null;
		}

		if (data.user) {
			this.user = this.client.users._add(data.user);
		}
	}

	/**
	 * The timestamp this soundboard sound was created at
	 *
	 * @type {number}
	 * @readonly
	 */
	get createdTimestamp() {
		return DiscordSnowflake.timestampFrom(this.soundId);
	}

	/**
	 * The time this soundboard sound was created at
	 *
	 * @type {Date}
	 * @readonly
	 */
	get createdAt() {
		return new Date(this.createdTimestamp);
	}

	/**
	 * The emoji of this soundboard sound
	 *
	 * @type {?Emoji}
	 * @readonly
	 */
	get emoji() {
		if (!this._emoji) return null;

		return this.guild?.emojis.cache.get(this._emoji.id) ?? new Emoji(this.client, this._emoji);
	}

	/**
	 * The guild this soundboard sound is part of
	 *
	 * @type {?Guild}
	 * @readonly
	 */
	get guild() {
		return this.client.guilds.resolve(this.guildId);
	}

	/**
	 * A link to this soundboard sound
	 *
	 * @type {string}
	 * @readonly
	 */
	get url() {
		return this.client.rest.cdn.soundboardSound(this.soundId);
	}

	/**
	 * Edits this soundboard sound.
	 *
	 * @param {GuildSoundboardSoundEditOptions} options The options to provide
	 * @returns {Promise<SoundboardSound>}
	 * @example
	 * // Update the name of a soundboard sound
	 * soundboardSound.edit({ name: 'new name' })
	 *   .then(sound => console.log(`Updated the name of the soundboard sound to ${sound.name}`))
	 *   .catch(console.error);
	 */
	async edit(options: any) {
		if (!this.guildId) throw new DiscordjsError(ErrorCodes.NotGuildSoundboardSound, 'edited');

		return this.guild.soundboardSounds.edit(this, options);
	}

	/**
	 * Deletes this soundboard sound.
	 *
	 * @param {string} [reason] Reason for deleting this soundboard sound
	 * @returns {Promise<SoundboardSound>}
	 * @example
	 * // Delete a soundboard sound
	 * soundboardSound.delete()
	 *   .then(sound => console.log(`Deleted soundboard sound ${sound.name}`))
	 *   .catch(console.error);
	 */
	async delete(reason: any) {
		if (!this.guildId) throw new DiscordjsError(ErrorCodes.NotGuildSoundboardSound, 'deleted');

		await this.guild.soundboardSounds.delete(this, reason);

		return this;
	}

	/**
	 * Whether this soundboard sound is the same as another one.
	 *
	 * @param {SoundboardSound|APISoundboardSound} other The soundboard sound to compare it to
	 * @returns {boolean}
	 */
	equals(other: any) {
		if (other instanceof SoundboardSound) {
			return (
				this.soundId === other.soundId &&
				this.available === other.available &&
				this.name === other.name &&
				this.volume === other.volume &&
				this._emoji?.id === other._emoji?.id &&
				this._emoji?.name === other._emoji?.name &&
				this.guildId === other.guildId &&
				this.user?.id === other.user?.id
			);
		}

		return (
			this.soundId === other.sound_id &&
			this.available === other.available &&
			this.name === other.name &&
			this.volume === other.volume &&
			(this._emoji?.id ?? null) === other.emoji_id &&
			(this._emoji?.name ?? null) === other.emoji_name &&
			this.guildId === other.guild_id &&
			this.user?.id === other.user?.id
		);
	}
}
