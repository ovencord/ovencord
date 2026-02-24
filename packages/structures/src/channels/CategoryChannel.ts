import type { APIGuildCategoryChannel, ChannelType } from 'discord-api-types/v10';
import { Mixin } from '../Mixin.js';
import type { MixinTypes } from '../MixinTypes.d.ts';
import type { Partialize } from '../utils/types.js';
import { Channel } from './Channel.js';
import { ChannelPermissionMixin } from './mixins/ChannelPermissionMixin.js';
import { GuildChannelMixin } from './mixins/GuildChannelMixin.js';

class CategoryChannelImpl<Omitted extends keyof APIGuildCategoryChannel | '' = ''> extends Channel<
	ChannelType.GuildCategory,
	Omitted
> {
	public constructor(data: Partialize<APIGuildCategoryChannel, Omitted>) {
		super(data);
		this.optimizeData(data);
	}
}

Mixin(CategoryChannelImpl, [ChannelPermissionMixin, GuildChannelMixin]);

export interface CategoryChannel<Omitted extends keyof APIGuildCategoryChannel | '' = ''>
	extends CategoryChannelImpl<Omitted>,
		MixinTypes<
			Channel<ChannelType.GuildCategory>,
			[ChannelPermissionMixin<ChannelType.GuildCategory>, GuildChannelMixin<ChannelType.GuildCategory>]
		> {}

export const CategoryChannel: {
	new <Omitted extends keyof APIGuildCategoryChannel | '' = ''>(
		data: Partialize<APIGuildCategoryChannel, Omitted>,
	): CategoryChannel<Omitted>;
} = CategoryChannelImpl as any;
