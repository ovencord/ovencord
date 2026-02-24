import type { ChannelType, ThreadChannelType } from 'discord-api-types/v10';
import { kData } from '../../utils/symbols.js';
import type { Channel } from '../Channel.js';

export interface ChannelOwnerMixin<Type extends ChannelType.GroupDM | ThreadChannelType> extends Channel<Type> {}

export class ChannelOwnerMixinImpl<_Type extends ChannelType.GroupDM | ThreadChannelType> {
	/**
	 * The id of the creator of the group DM or thread
	 */
	public get ownerId() {
		return (this as any)[kData].owner_id;
	}
}

export const ChannelOwnerMixin: typeof ChannelOwnerMixinImpl = ChannelOwnerMixinImpl as any;
