import type { ChannelType } from 'discord-api-types/v10';
import { kData } from '../../utils/symbols.js';
import type { Channel } from '../Channel.js';

export interface GroupDMMixin extends Channel<ChannelType.GroupDM> {}

export class GroupDMMixinImpl {
	/**
	 * The icon hash of the group DM.
	 */
	public get icon() {
		return (this as any)[kData].icon;
	}

	/**
	 * Whether the channel is managed by an application via the `gdm.join` OAuth2 scope.
	 */
	public get managed() {
		return (this as any)[kData].managed;
	}

	/**
	 * The application id of the group DM creator if it is bot-created.
	 */
	public get applicationId() {
		return (this as any)[kData].application_id;
	}
}

export const GroupDMMixin: typeof GroupDMMixinImpl = GroupDMMixinImpl as any;
