import type { GatewayThreadCreateDispatchData } from 'discord-api-types/v10';
import { Events } from '../../util/Events.js';
import { Action } from './Action.js';

export class ThreadCreateAction extends Action {
	override handle(data: GatewayThreadCreateDispatchData) {
		const client = this.client;
		const existing = client.channels.cache.has(data.id);
		const thread = client.channels._add(data);
		if (!existing && thread) {
			/**
			 * Emitted whenever a thread is created or when the client user is added to a thread.
			 *
			 * @event Client#threadCreate
			 * @param {ThreadChannel} thread The thread that was created
			 * @param {boolean} newlyCreated Whether the thread was newly created
			 */
			client.emit(Events.ThreadCreate, thread, data.newly_created ?? false);
		}

		return { thread };
	}
}
