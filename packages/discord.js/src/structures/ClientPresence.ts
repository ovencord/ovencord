import type {
	GatewayActivityUpdateData,
	GatewayPresenceUpdate,
	GatewayPresenceUpdateData,
} from 'discord-api-types/v10';
import { ActivityType, GatewayOpcodes } from 'discord-api-types/v10';
import type { Client } from '../client/Client.js';
import { DiscordjsTypeError, ErrorCodes } from '../errors/index.js';
import { Presence } from './Presence.js';

/**
 * Represents the client's presence.
 *
 * @extends {Presence}
 */
export class ClientPresence extends Presence {
	constructor(client: Client, data: Record<string, unknown> = {}) {
		super(
			client,
			Object.assign(data, {
				status: (data as unknown as { status?: string }).status ?? 'online',
				user: { id: null },
			}) as unknown as Partial<GatewayPresenceUpdate>,
		);
	}

	/**
	 * Sets the client's presence
	 *
	 * @param {PresenceData} presence The data to set the presence to
	 * @returns {Promise<ClientPresence>}
	 */
	async set(presence: Record<string, unknown>) {
		const packet = this._parse(presence) as unknown as GatewayPresenceUpdateData;
		this._patch(packet as unknown as Partial<GatewayPresenceUpdate>);
		if (presence.shardId === undefined) {
			await this.client._broadcast({ op: GatewayOpcodes.PresenceUpdate, d: packet });
		} else if (Array.isArray(presence.shardId)) {
			await Promise.all(
				presence.shardId.map((shardId: number) =>
					this.client.ws.send(shardId, { op: GatewayOpcodes.PresenceUpdate, d: packet }),
				),
			);
		} else {
			await this.client.ws.send(presence.shardId as number, { op: GatewayOpcodes.PresenceUpdate, d: packet });
		}

		return this;
	}

	/**
	 * Parses presence data into a packet ready to be sent to Discord
	 *
	 * @param {PresenceData} presence The data to parse
	 * @returns {GatewayPresenceUpdateData}
	 * @private
	 */
	_parse({ status, since, afk, activities }: Record<string, unknown>): Record<string, unknown> {
		const data = {
			activities: [] as GatewayActivityUpdateData[],
			afk: typeof afk === 'boolean' ? afk : false,
			since: typeof since === 'number' && !Number.isNaN(since) ? since : null,
			status: status ?? this.status,
		};
		if (Array.isArray(activities) && activities.length) {
			for (const [i, activity] of activities.entries()) {
				if (typeof activity.name !== 'string') {
					throw new DiscordjsTypeError(ErrorCodes.InvalidType, `activities[${i}].name`, 'string');
				}

				activity.type ??= ActivityType.Playing;

				if (activity.type === ActivityType.Custom && !activity.state) {
					activity.state = activity.name;
					activity.name = 'Custom Status';
				}

				data.activities.push({
					type: activity.type,
					name: activity.name,
					state: activity.state,
					url: activity.url,
				});
			}
		} else if (!activities && (status || afk || since) && this.activities.length) {
			data.activities.push(
				...this.activities.map((activity) => ({
					name: activity.name,
					state: activity.state ?? undefined,
					type: activity.type,
					url: activity.url ?? undefined,
				})),
			);
		}

		return data;
	}
}
