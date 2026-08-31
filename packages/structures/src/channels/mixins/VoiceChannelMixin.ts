import type { ChannelType } from 'discord-api-types/v10';
import { kData } from '../../utils/symbols.js';
import type { Channel } from '../Channel.js';
import { TextChannelMixin, TextChannelMixinImpl } from './TextChannelMixin.js';

export interface VoiceChannelMixin<
	Type extends ChannelType.GuildStageVoice | ChannelType.GuildVoice =
		| ChannelType.GuildStageVoice
		| ChannelType.GuildVoice,
> extends Channel<Type> {}

export class VoiceChannelMixinImpl<
	Type extends ChannelType.GuildStageVoice | ChannelType.GuildVoice =
		| ChannelType.GuildStageVoice
		| ChannelType.GuildVoice,
> extends TextChannelMixinImpl<Type> {
	/**
	 * The bitrate (in bits) of the voice channel.
	 */
	public get bitrate() {
		return (this as any)[kData].bitrate;
	}

	/**
	 * The voice region id for this channel, automatic when set to null.
	 */
	public get rtcRegion() {
		return (this as any)[kData].rtc_region ?? null;
	}

	/**
	 * The camera video quality mode of the voice channel, {@link discord-api-types/v10#(VideoQualityMode:enum) | Auto} when not present.
	 */
	public get videoQualityMode() {
		return (this as any)[kData].video_quality_mode ?? null;
	}

	/**
	 * The user limit of the voice channel.
	 */
	public get userLimit() {
		return (this as any)[kData].user_limit;
	}

	/**
	 * Indicates whether this channel has voice connection capabilities
	 */
	public override isVoiceBased(): this is VoiceChannelMixin & this {
		return true;
	}
}

export const VoiceChannelMixin: typeof VoiceChannelMixinImpl = VoiceChannelMixinImpl as any;
