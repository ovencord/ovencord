import type { TextChannelType } from 'discord-api-types/v10';
import { kData } from '../../utils/symbols.js';
import type { Channel } from '../Channel.js';
import type { VoiceChannelMixin } from './VoiceChannelMixin.js';

export interface TextChannelMixin<Type extends TextChannelType = TextChannelType> extends Channel<Type> {}

export class TextChannelMixinImpl<_Type extends TextChannelType = TextChannelType> {
	/**
	 * The id of the last message sent in this channel.
	 */
	public get lastMessageId() {
		return (this as any)[kData].last_message_id;
	}

	/**
	 * Indicates whether this channel can contain messages
	 */
	public isTextBased(): this is TextChannelMixin & this {
		return true;
	}

	/**
	 * Indicates whether this channel has voice connection capabilities
	 */
	public isVoiceBased(): this is VoiceChannelMixin & this {
		return false;
	}
}

export const TextChannelMixin: typeof TextChannelMixinImpl = TextChannelMixinImpl as any;
