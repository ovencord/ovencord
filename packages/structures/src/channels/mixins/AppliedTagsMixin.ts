import type { ChannelType } from 'discord-api-types/v10';
import { kData } from '../../utils/symbols.js';
import type { Channel } from '../Channel.js';

export interface AppliedTagsMixin extends Channel<ChannelType.PublicThread> {}

export class AppliedTagsMixinImpl {
	/**
	 * The ids of the set of tags that have been applied to a thread in a {@link (ForumChannel:class)} or a {@link (MediaChannel:class)}.
	 */
	public get appliedTags(): readonly string[] | null {
		return Array.isArray((this as any)[kData].applied_tags) ? (this as any)[kData].applied_tags : null;
	}
}

export const AppliedTagsMixin: typeof AppliedTagsMixinImpl = AppliedTagsMixinImpl as any;
