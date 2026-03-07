import { Collection } from '@ovencord/collection';
import type { GatewayThreadMembersUpdateDispatchData } from 'discord-api-types/v10';
import type { ThreadMember } from '../../structures/ThreadMember.js';
import { Events } from '../../util/Events.js';
import { Action } from './Action.js';

export class ThreadMembersUpdateAction extends Action {
	override handle(data: GatewayThreadMembersUpdateDispatchData) {
		const client = this.client;
		const thread = client.channels.cache.get(data.id);
		if (thread) {
			thread.memberCount = data.member_count;
			const addedMembers = new Collection();
			const removedMembers = new Collection();

			data.added_members?.reduce(
				(
					_addedMembers: Collection<string, ThreadMember>,
					addedMember: GatewayThreadMembersUpdateDispatchData['added_members'][number],
				) => _addedMembers.set(addedMember.user_id, thread.members._add(addedMember)),
				addedMembers,
			);

			data.removed_member_ids?.reduce(
				(removedMembersIds: Collection<string, ThreadMember>, removedMembersId: string) => {
					const threadMember = this.getThreadMember(removedMembersId, thread.members);
					if (threadMember) removedMembersIds.set(threadMember.id, threadMember);
					thread.members.cache.delete(removedMembersId);
					return removedMembersIds;
				},
				removedMembers,
			);

			if (addedMembers.size === 0 && removedMembers.size === 0) {
				// Uncached thread member(s) left.
				return {};
			}

			/**
			 * Emitted whenever members are added or removed from a thread.
			 * <info>This event requires the {@link GatewayIntentBits.GuildMembers} privileged gateway intent.</info>
			 *
			 * @event Client#threadMembersUpdate
			 * @param {Collection<Snowflake, ThreadMember>} addedMembers The members that were added
			 * @param {Collection<Snowflake, ThreadMember>} removedMembers The members that were removed
			 * @param {ThreadChannel} thread The thread where members got updated
			 */
			client.emit(Events.ThreadMembersUpdate, addedMembers, removedMembers, thread);
		}

		return {};
	}
}
