import { Collection } from '@ovencord/collection';
import { makeURLSearchParams } from '@ovencord/rest';
import type { Snowflake } from 'discord-api-types/v10';
import { Routes } from 'discord-api-types/v10';
import { DiscordjsError, DiscordjsTypeError, ErrorCodes } from '../errors/index.js';
import type { Guild } from '../structures/Guild.js';
import { GuildBan } from '../structures/GuildBan.js';
import { CachedManager } from './CachedManager.js';
import type { BaseFetchOptions, UserResolvable } from './UserManager.js';

export type GuildBanResolvable = GuildBan | UserResolvable;

export interface FetchBanOptions extends BaseFetchOptions {
	user: UserResolvable;
}

export interface FetchBansOptions {
	limit?: number;
	before?: Snowflake;
	after?: Snowflake;
	cache?: boolean;
}

export interface BanOptions {
	deleteMessageSeconds?: number;
	reason?: string;
}

export interface BulkBanResult {
	bannedUsers: Snowflake[];
	failedUsers: Snowflake[];
}

/**
 * Manages API methods for guild bans and stores their cache.
 *
 * @extends {CachedManager}
 */
export class GuildBanManager extends CachedManager<Snowflake, GuildBan, GuildBanResolvable> {
	public guild: Guild;
	// biome-ignore lint/suspicious/noExplicitAny: iterable hydration
	constructor(guild: Guild, iterable?: Iterable<any>) {
		super(guild.client, GuildBan, iterable);

		/**
		 * The guild this Manager belongs to
		 *
		 * @type {Guild}
		 */
		this.guild = guild;
	}

	// biome-ignore lint/suspicious/noExplicitAny: internal cache hydration
	override _add(data: any, cache?: boolean) {
		return super._add(data, cache, { id: data.user.id, extras: [this.guild] });
	}

	/**
	 * Resolves a GuildBanResolvable to a GuildBan object.
	 *
	 * @param {GuildBanResolvable} ban The ban that is in the guild
	 * @returns {?GuildBan}
	 */
	override resolve(ban: GuildBanResolvable | null | undefined): GuildBan | null {
		return super.resolve(ban) ?? super.resolve(this.client.users.resolveId(ban as UserResolvable));
	}

	/**
	 * Fetches ban(s) from Discord.
	 *
	 * @param {UserResolvable|FetchBanOptions|FetchBansOptions} [options] Options for fetching guild ban(s)
	 * @returns {Promise<GuildBan|Collection<Snowflake, GuildBan>>}
	 */
	async fetch(
		options?: UserResolvable | FetchBanOptions | FetchBansOptions,
	): Promise<GuildBan | Collection<Snowflake, GuildBan>> {
		if (!options) return this._fetchMany();
		const { user, cache, force, limit, before, after } = (options as FetchBanOptions & FetchBansOptions) ?? {};
		const resolvedUser = this.client.users.resolveId(user ?? (options as UserResolvable));
		if (resolvedUser) return this._fetchSingle({ user: resolvedUser, cache, force });

		if (!before && !after && !limit && cache === undefined) {
			throw new DiscordjsError(ErrorCodes.FetchBanResolveId);
		}

		return this._fetchMany(options as FetchBansOptions);
	}

	// biome-ignore lint/suspicious/noExplicitAny: fetch helper
	async _fetchSingle({ user, cache, force = false }: any): Promise<GuildBan> {
		if (!force) {
			const existing = this.cache.get(user);
			// biome-ignore lint/suspicious/noExplicitAny: partial check
			if (existing && !(existing as any).partial) return existing;
		}

		// biome-ignore lint/suspicious/noExplicitAny: ban REST response
		const data = (await this.client.rest.get(Routes.guildBan(this.guild.id, user))) as any;
		return this._add(data, cache);
	}

	// biome-ignore lint/suspicious/noExplicitAny: fetch helper
	async _fetchMany({ cache, ...apiOptions }: any = {}): Promise<Collection<Snowflake, GuildBan>> {
		// biome-ignore lint/suspicious/noExplicitAny: bans REST response
		const data = (await this.client.rest.get(Routes.guildBans(this.guild.id), {
			query: makeURLSearchParams(apiOptions),
		})) as any[];

		return data.reduce(
			// biome-ignore lint/suspicious/noExplicitAny: reducer accumulation
			(col: Collection<Snowflake, GuildBan>, ban: any) => col.set(ban.user.id, this._add(ban, cache)),
			new Collection(),
		);
	}

	/**
	 * Bans a user from the guild.
	 *
	 * @param {UserResolvable} user The user to ban
	 * @param {BanOptions} [options={}] Options for the ban
	 * @returns {Promise<void>}
	 */
	async create(user: UserResolvable, options: BanOptions = {}): Promise<void> {
		if (typeof options !== 'object' || options === null) {
			throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'options', 'object', true);
		}
		const id = this.client.users.resolveId(user);
		if (!id) throw new DiscordjsError(ErrorCodes.BanResolveId, true);

		await this.client.rest.put(Routes.guildBan(this.guild.id, id), {
			body: {
				delete_message_seconds: options.deleteMessageSeconds,
			},
			reason: options.reason,
		});
	}

	/**
	 * Unbans a user from the guild.
	 *
	 * @param {UserResolvable} user The user to unban
	 * @param {string} [reason] Reason for unbanning user
	 * @returns {Promise<void>}
	 */
	async remove(user: UserResolvable, reason?: string): Promise<void> {
		const id = this.client.users.resolveId(user);
		if (!id) throw new DiscordjsError(ErrorCodes.BanResolveId);
		await this.client.rest.delete(Routes.guildBan(this.guild.id, id), { reason });
	}

	/**
	 * Bulk ban users from a guild, and optionally delete previous messages sent by them.
	 *
	 * @param {Collection<Snowflake, UserResolvable>|UserResolvable[]} users The users to ban
	 * @param {BanOptions} [options] The options for bulk banning users
	 * @returns {Promise<BulkBanResult>}
	 */
	async bulkCreate(
		users: Collection<Snowflake, UserResolvable> | UserResolvable[],
		options: BanOptions = {},
	): Promise<BulkBanResult> {
		if (!users || !(Array.isArray(users) || users instanceof Collection)) {
			throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'users', 'Array or Collection of UserResolvable', true);
		}

		if (typeof options !== 'object' || options === null) {
			throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'options', 'object', true);
		}

		// biome-ignore lint/suspicious/noExplicitAny: user resolution
		const userIds = (users as any).map((user: any) => this.client.users.resolveId(user));
		if (userIds.length === 0) throw new DiscordjsError(ErrorCodes.BulkBanUsersOptionEmpty);

		// biome-ignore lint/suspicious/noExplicitAny: bulk ban REST response
		const result = (await this.client.rest.post(Routes.guildBulkBan(this.guild.id), {
			body: { delete_message_seconds: options.deleteMessageSeconds, user_ids: userIds },
			reason: options.reason,
		})) as any;
		return { bannedUsers: result.banned_users, failedUsers: result.failed_users };
	}
}
