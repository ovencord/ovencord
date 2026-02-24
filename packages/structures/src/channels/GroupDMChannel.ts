import type { APIGroupDMChannel, ChannelType } from 'discord-api-types/v10';
import { Mixin } from '../Mixin.js';
import type { MixinTypes } from '../MixinTypes.d.ts';
import type { Partialize } from '../utils/types.js';
import { Channel } from './Channel.js';
import { ChannelOwnerMixin } from './mixins/ChannelOwnerMixin.js';
import { DMChannelMixin } from './mixins/DMChannelMixin.js';
import { GroupDMMixin } from './mixins/GroupDMMixin.js';
import { TextChannelMixin } from './mixins/TextChannelMixin.js';

class GroupDMChannelImpl<Omitted extends keyof APIGroupDMChannel | '' = ''> extends Channel<
	ChannelType.GroupDM,
	Omitted
> {
	public constructor(data: Partialize<APIGroupDMChannel, Omitted>) {
		super(data);
		this.optimizeData(data);
	}
}

Mixin(GroupDMChannelImpl, [DMChannelMixin, TextChannelMixin, ChannelOwnerMixin, GroupDMMixin]);

export interface GroupDMChannel<Omitted extends keyof APIGroupDMChannel | '' = ''>
	extends GroupDMChannelImpl<Omitted>,
		MixinTypes<
			Channel<ChannelType.GroupDM>,
			[
				DMChannelMixin<ChannelType.GroupDM>,
				TextChannelMixin<ChannelType.GroupDM>,
				ChannelOwnerMixin<ChannelType.GroupDM>,
				GroupDMMixin,
			]
		> {}

export const GroupDMChannel: {
	new <Omitted extends keyof APIGroupDMChannel | '' = ''>(
		data: Partialize<APIGroupDMChannel, Omitted>,
	): GroupDMChannel<Omitted>;
} = GroupDMChannelImpl as any;
