import { PermissionFlagsBits, Routes } from 'discord-api-types/v10';
import { BaseGuildVoiceChannel } from './BaseGuildVoiceChannel.js';
import type { SoundboardSound } from './SoundboardSound.js';

export interface SendSoundboardSoundOptions {
	soundId: string;
	guildId?: string;
}

/**
 * Represents a guild voice channel on Discord.
 *
 * @extends {BaseGuildVoiceChannel}
 */
export class VoiceChannel extends BaseGuildVoiceChannel {
	/**
	 * Whether the channel is joinable by the client user
	 *
	 * @type {boolean}
	 * @readonly
	 */
	get joinable() {
		if (!super.joinable) return false;
		return (
			!this.full || this.permissionsFor(this.client.user?.id as string)?.has(PermissionFlagsBits.MoveMembers, false)
		);
	}

	/**
	 * Checks if the client has permission to send audio to the voice channel
	 *
	 * @type {boolean}
	 * @readonly
	 */
	get speakable() {
		const permissions = this.permissionsFor(this.client.user?.id as string);
		if (!permissions) return false;
		// This flag allows speaking even if timed out
		if (permissions.has(PermissionFlagsBits.Administrator, false)) return true;

		return (
			this.guild.members.me.communicationDisabledUntilTimestamp < Date.now() &&
			permissions.has(PermissionFlagsBits.Speak, false)
		);
	}

	/**
	 * @typedef {Object} SendSoundboardSoundOptions
	 * @property {string} soundId The id of the soundboard sound to send
	 * @property {string} [guildId] The id of the guild the soundboard sound is a part of
	 */

	/**
	 * Send a soundboard sound to a voice channel the user is connected to.
	 *
	 * @param {SoundboardSound|SendSoundboardSoundOptions} sound The sound to send
	 * @returns {Promise<void>}
	 */
	async sendSoundboardSound(sound: SoundboardSound | SendSoundboardSoundOptions) {
		await this.client.rest.post(Routes.sendSoundboardSound(this.id), {
			body: {
				sound_id: sound.soundId,
				source_guild_id: sound.guildId ?? undefined,
			},
		});
	}
	/**
	 * Sets the camera video quality mode of the channel.
	 *
	 * @param {VideoQualityMode} videoQualityMode The new camera video quality mode.
	 * @param {string} [reason] Reason for changing the camera video quality mode.
	 * @returns {Promise<VoiceChannel>}
	 */
	public override setVideoQualityMode(videoQualityMode: any, reason?: string): Promise<VoiceChannel> {
		return super.setVideoQualityMode(videoQualityMode, reason) as Promise<VoiceChannel>;
	}
}
