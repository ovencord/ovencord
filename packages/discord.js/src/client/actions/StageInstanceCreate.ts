import type { GatewayStageInstanceCreateDispatchData } from 'discord-api-types/v10';
import { Events } from '../../util/Events.js';
import { Action } from './Action.js';

export class StageInstanceCreateAction extends Action {
	override handle(data: GatewayStageInstanceCreateDispatchData) {
		const client = this.client;
		const channel = this.getChannel({ id: data.channel_id, guild_id: data.guild_id });

		if (channel) {
			const stageInstance = channel.guild.stageInstances._add(data);

			/**
			 * Emitted whenever a stage instance is created.
			 *
			 * @event Client#stageInstanceCreate
			 * @param {StageInstance} stageInstance The created stage instance
			 */
			client.emit(Events.StageInstanceCreate, stageInstance);

			return { stageInstance };
		}

		return {};
	}
}
