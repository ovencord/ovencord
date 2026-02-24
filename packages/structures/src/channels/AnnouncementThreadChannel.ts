import type { APIAnnouncementThreadChannel, ChannelType } from 'discord-api-types/v10';
import { Mixin } from '../Mixin.js';
import type { MixinTypes } from '../MixinTypes.d.ts';
import type { Partialize } from '../utils/types.js';
import { Channel } from './Channel.js';
import { ChannelOwnerMixin } from './mixins/ChannelOwnerMixin.js';
import { ChannelParentMixin } from './mixins/ChannelParentMixin.js';
import { ChannelPinMixin } from './mixins/ChannelPinMixin.js';
import { ChannelSlowmodeMixin } from './mixins/ChannelSlowmodeMixin.js';
import { GuildChannelMixin } from './mixins/GuildChannelMixin.js';
import { TextChannelMixin } from './mixins/TextChannelMixin.js';
import { ThreadChannelMixin } from './mixins/ThreadChannelMixin.js';

class AnnouncementThreadChannelImpl<Omitted extends keyof APIAnnouncementThreadChannel | '' = ''> extends Channel<
	ChannelType.AnnouncementThread,
	Omitted
> {
	public constructor(data: Partialize<APIAnnouncementThreadChannel, Omitted>) {
		super(data);
		this.optimizeData?.(data);
	}
}

Mixin(AnnouncementThreadChannelImpl, [
	TextChannelMixin,
	ChannelOwnerMixin,
	ChannelParentMixin,
	ChannelPinMixin,
	ChannelSlowmodeMixin,
	GuildChannelMixin,
	ThreadChannelMixin,
]);

export interface AnnouncementThreadChannel<Omitted extends keyof APIAnnouncementThreadChannel | '' = ''>
	extends AnnouncementThreadChannelImpl<Omitted>,
		MixinTypes<
			Channel<ChannelType.AnnouncementThread>,
			[
				TextChannelMixin<ChannelType.AnnouncementThread>,
				ChannelOwnerMixin<ChannelType.AnnouncementThread>,
				ChannelParentMixin<ChannelType.AnnouncementThread>,
				ChannelPinMixin<ChannelType.AnnouncementThread>,
				ChannelSlowmodeMixin<ChannelType.AnnouncementThread>,
				GuildChannelMixin<ChannelType.AnnouncementThread>,
				ThreadChannelMixin<ChannelType.AnnouncementThread>,
			]
		> {}

export const AnnouncementThreadChannel: {
	new <Omitted extends keyof APIAnnouncementThreadChannel | '' = ''>(
		data: Partialize<APIAnnouncementThreadChannel, Omitted>,
	): AnnouncementThreadChannel<Omitted>;
} = AnnouncementThreadChannelImpl as any;
