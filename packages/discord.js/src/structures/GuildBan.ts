import type { APIBan, GatewayGuildBanModifyDispatchData } from 'discord-api-types/v10';
import type { Client } from '../client/Client.js';
import { Base } from './Base.js';
import type { Guild } from './Guild.js';
import type { User } from './User.js';

/**
 * Represents a ban in a guild on Discord.
 *
 * @extends {Base}
 */
export class GuildBan extends Base {
	public guild: Guild;
	public user: User | null = null;
	public reason: string | null = null;
	constructor(client: Client, data: APIBan | GatewayGuildBanModifyDispatchData, guild: Guild) {
		super(client);

		/**
		 * The guild in which the ban is
		 *
		 * @type {Guild}
		 */
		this.guild = guild;

		this._patch(data);
	}

	override _patch(data: Partial<APIBan> | GatewayGuildBanModifyDispatchData) {
		if ('user' in data) {
			/**
			 * The user this ban applies to
			 *
			 * @type {User}
			 */
			this.user = this.client.users._add(data.user, true);
		}

		if ('reason' in data) {
			/**
			 * The reason for the ban
			 *
			 * @type {?string}
			 */
			this.reason = data.reason;
		}
	}

	/**
	 * Whether this GuildBan is partial. If the reason is not provided the value is null
	 *
	 * @type {boolean}
	 * @readonly
	 */
	get partial() {
		return !('reason' in this);
	}

	/**
	 * Fetches this GuildBan.
	 *
	 * @param {boolean} [force=true] Whether to skip the cache check and request the API
	 * @returns {Promise<GuildBan>}
	 */
	async fetch(force = true) {
		return this.guild.bans.fetch({ user: this.user, cache: true, force });
	}
}
