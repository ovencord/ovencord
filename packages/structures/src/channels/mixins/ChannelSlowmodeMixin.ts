import type { GuildTextChannelType } from 'discord-api-types/v10';
import { kData } from '../../utils/symbols.js';
import type { Channel } from '../Channel.js';
import { TextChannelMixin, TextChannelMixinImpl } from './TextChannelMixin.js';

export interface ChannelSlowmodeMixin<Type extends GuildTextChannelType> extends Channel<Type> {}

export class ChannelSlowmodeMixinImpl<Type extends GuildTextChannelType> extends TextChannelMixinImpl<Type> {
	/**
	 * The rate limit per user (slowmode) of this channel.
	 */
	public get rateLimitPerUser() {
		return (this as any)[kData].rate_limit_per_user;
	}
}

export const ChannelSlowmodeMixin: typeof ChannelSlowmodeMixinImpl = ChannelSlowmodeMixinImpl as any;
