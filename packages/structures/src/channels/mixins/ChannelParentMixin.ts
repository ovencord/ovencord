import type { ChannelType, GuildChannelType } from 'discord-api-types/v10';
import { kData } from '../../utils/symbols.js';
import type { Channel } from '../Channel.js';
import { GuildChannelMixin, GuildChannelMixinImpl } from './GuildChannelMixin.js';

export interface ChannelParentMixin<
	Type extends Exclude<GuildChannelType, ChannelType.GuildCategory | ChannelType.GuildDirectory>,
> extends Channel<Type> {}

class ChannelParentMixinImpl<
	Type extends Exclude<GuildChannelType, ChannelType.GuildCategory | ChannelType.GuildDirectory>,
> extends GuildChannelMixinImpl<Type> {
	/**
	 * The id of the parent category for a channel (each parent category can contain up to 50 channels) or id of the parent channel for a thread
	 */
	public get parentId() {
		return (this as any)[kData].parent_id;
	}

	/**
	 * Whether the channel is nsfw
	 */
	public get nsfw() {
		return (this as any)[kData].nsfw;
	}
}

export const ChannelParentMixin: typeof ChannelParentMixinImpl = ChannelParentMixinImpl as any;
