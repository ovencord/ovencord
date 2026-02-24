import type { APIGuildMediaChannel, ChannelType } from 'discord-api-types/v10';
import { Mixin } from '../Mixin.js';
import type { MixinTypes } from '../MixinTypes.d.ts';
import type { Partialize } from '../utils/types.js';
import { Channel } from './Channel.js';
import { ChannelParentMixin } from './mixins/ChannelParentMixin.js';
import { ChannelPermissionMixin } from './mixins/ChannelPermissionMixin.js';
import { ChannelTopicMixin } from './mixins/ChannelTopicMixin.js';
import { ThreadOnlyChannelMixin } from './mixins/ThreadOnlyChannelMixin.js';

export interface MediaChannel<Omitted extends keyof APIGuildMediaChannel | '' = ''>
	extends MediaChannelImpl<Omitted>,
		MixinTypes<
			Channel<ChannelType.GuildMedia>,
			[
				ChannelParentMixin<ChannelType.GuildMedia>,
				ChannelPermissionMixin<ChannelType.GuildMedia>,
				ChannelTopicMixin<ChannelType.GuildMedia>,
				ThreadOnlyChannelMixin<ChannelType.GuildMedia>,
			]
		> {}

/**
 * Sample Implementation of a structure for media channels, usable by direct end consumers.
 */
class MediaChannelImpl<Omitted extends keyof APIGuildMediaChannel | '' = ''> extends Channel<
	ChannelType.GuildMedia,
	Omitted
> {
	public constructor(data: Partialize<APIGuildMediaChannel, Omitted>) {
		super(data);
		this.optimizeData(data);
	}
}

Mixin(MediaChannelImpl, [ChannelParentMixin, ChannelPermissionMixin, ChannelTopicMixin, ThreadOnlyChannelMixin]);

export const MediaChannel: {
	new <Omitted extends keyof APIGuildMediaChannel | '' = ''>(
		data: Partialize<APIGuildMediaChannel, Omitted>,
	): MediaChannel<Omitted>;
} = MediaChannelImpl as any;
