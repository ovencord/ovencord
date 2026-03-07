import type { GatewayGuildUpdateDispatchData } from 'discord-api-types/v10';
import { Events } from '../../util/Events.js';
import { Action } from './Action.js';

export class GuildUpdateAction extends Action {
	override handle(data: GatewayGuildUpdateDispatchData) {
		const client = this.client;

		const guild = client.guilds.cache.get(data.id);
		if (guild) {
			const old = guild._update(data);
			/**
			 * Emitted whenever a guild is updated - e.g. name change.
			 *
			 * @event Client#guildUpdate
			 * @param {Guild} oldGuild The guild before the update
			 * @param {Guild} newGuild The guild after the update
			 */
			client.emit(Events.GuildUpdate, old, guild);
			return {
				old,
				updated: guild,
			};
		}

		return {
			old: null,
			updated: null,
		};
	}
}
