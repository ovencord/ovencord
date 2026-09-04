import type { ChannelType } from 'discord-api-types/v10';
import { kData } from '../../utils/symbols.js';
import type { Channel } from '../Channel.js';
import { ChannelWebhookMixinImpl } from './ChannelWebhookMixin.js';

export interface ChannelTopicMixin<
	Type extends ChannelType.GuildAnnouncement | ChannelType.GuildForum | ChannelType.GuildMedia | ChannelType.GuildText,
> extends Channel<Type> {}

export class ChannelTopicMixinImpl<
	Type extends ChannelType.GuildAnnouncement | ChannelType.GuildForum | ChannelType.GuildMedia | ChannelType.GuildText,
> extends ChannelWebhookMixinImpl<Type> {
	/**
	 * The topic of this channel.
	 */
	public get topic() {
		return (this as any)[kData].topic;
	}

	/**
	 * The duration after which new threads get archived by default on this channel.
	 */
	public get defaultAutoArchiveDuration() {
		return (this as any)[kData].default_auto_archive_duration;
	}

	/**
	 * The default value for rate limit per user (slowmode) on new threads in this channel.
	 */
	public get defaultThreadRateLimitPerUser() {
		return (this as any)[kData].default_thread_rate_limit_per_user;
	}
}

export const ChannelTopicMixin: typeof ChannelTopicMixinImpl = ChannelTopicMixinImpl as any;
