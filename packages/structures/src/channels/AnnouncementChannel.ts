import type { APINewsChannel, ChannelType } from 'discord-api-types/v10';
import { Mixin } from '../Mixin.js';
import type { MixinTypes } from '../MixinTypes.d.ts';
import type { Partialize } from '../utils/types.js';
import { Channel } from './Channel.js';
import { ChannelParentMixin } from './mixins/ChannelParentMixin.js';
import { ChannelPermissionMixin } from './mixins/ChannelPermissionMixin.js';
import { ChannelPinMixin } from './mixins/ChannelPinMixin.js';
import { ChannelSlowmodeMixin } from './mixins/ChannelSlowmodeMixin.js';
import { ChannelTopicMixin } from './mixins/ChannelTopicMixin.js';
import { TextChannelMixin } from './mixins/TextChannelMixin.js';

class AnnouncementChannelImpl<Omitted extends keyof APINewsChannel | '' = ''> extends Channel<
	ChannelType.GuildAnnouncement,
	Omitted
> {
	public constructor(data: Partialize<APINewsChannel, Omitted>) {
		super(data);
		this.optimizeData(data);
	}
}

Mixin(AnnouncementChannelImpl, [
	TextChannelMixin,
	ChannelParentMixin,
	ChannelPermissionMixin,
	ChannelPinMixin,
	ChannelSlowmodeMixin,
	ChannelTopicMixin,
]);

export interface AnnouncementChannel<Omitted extends keyof APINewsChannel | '' = ''>
	extends AnnouncementChannelImpl<Omitted>,
		MixinTypes<
			Channel<ChannelType.GuildAnnouncement>,
			[
				TextChannelMixin<ChannelType.GuildAnnouncement>,
				ChannelParentMixin<ChannelType.GuildAnnouncement>,
				ChannelPermissionMixin<ChannelType.GuildAnnouncement>,
				ChannelPinMixin<ChannelType.GuildAnnouncement>,
				ChannelSlowmodeMixin<ChannelType.GuildAnnouncement>,
				ChannelTopicMixin<ChannelType.GuildAnnouncement>,
			]
		> {}

export const AnnouncementChannel: {
	new <Omitted extends keyof APINewsChannel | '' = ''>(
		data: Partialize<APINewsChannel, Omitted>,
	): AnnouncementChannel<Omitted>;
} = AnnouncementChannelImpl as any;
