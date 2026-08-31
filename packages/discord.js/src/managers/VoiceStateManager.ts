import type { Snowflake } from 'discord-api-types/v10';
import { Routes } from 'discord-api-types/v10';
import type { Guild } from '../structures/Guild.js';
import { VoiceState } from '../structures/VoiceState.js';
import { CachedManager } from './CachedManager.js';
import type { BaseFetchOptions, UserResolvable } from './UserManager.js';

export type VoiceStateResolvable = UserResolvable | '@me';

/**
 * Manages API methods for VoiceStates and stores their cache.
 *
 * @extends {CachedManager}
 */
export class VoiceStateManager extends CachedManager<Snowflake, VoiceState, VoiceStateResolvable> {
	public guild: Guild;
	// biome-ignore lint/suspicious/noExplicitAny: iterable hydration
	constructor(guild: Guild, iterable?: Iterable<any>) {
		super(guild.client, VoiceState, iterable);

		/**
		 * The guild this manager belongs to
		 *
		 * @type {Guild}
		 */
		this.guild = guild;
	}

	// biome-ignore lint/suspicious/noExplicitAny: internal cache hydration
	override _add(data: any, cache = true) {
		const existing = this.cache.get(data.user_id);
		if (existing) return existing._patch(data);

		const entry = new this.holds(this.guild, data);
		if (cache) this.cache.set(data.user_id, entry);
		return entry;
	}

	/**
	 * Obtains a user's voice state from discord or from the cache if it's already available.
	 *
	 * @param {UserResolvable|'@me'} member The member whose voice state is to be fetched
	 * @param {BaseFetchOptions} [options] Additional options for this fetch
	 * @returns {Promise<VoiceState>}
	 */
	async fetch(
		member: VoiceStateResolvable,
		{ cache = true, force = false }: BaseFetchOptions = {},
	): Promise<VoiceState> {
		const id = member === '@me' ? member : this.guild.members.resolveId(member);
		if (!id) throw new Error('Invalid member resolvable');
		if (!force) {
			const existing = this.cache.get(id === '@me' ? (this.client.user?.id as string) : id);
			if (existing) return existing;
		}

		// biome-ignore lint/suspicious/noExplicitAny: voice state REST response
		const data = (await this.client.rest.get(Routes.guildVoiceState(this.guild.id, id))) as any;
		return this._add(data, cache);
	}
}
