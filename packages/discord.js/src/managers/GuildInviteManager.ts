import { Collection } from '@ovencord/collection';
import type { InviteTargetType, Snowflake } from 'discord-api-types/v10';
import { Routes } from 'discord-api-types/v10';
import { DiscordjsError, ErrorCodes } from '../errors/index.js';
import type { Guild } from '../structures/Guild.js';
import { GuildInvite } from '../structures/GuildInvite.js';
import type { InviteResolvable } from '../util/DataResolver.js';
import { resolveInviteCode } from '../util/DataResolver.js';
import { CachedManager } from './CachedManager.js';
import type { GuildChannelResolvable } from './GuildChannelManager.js';
import type { BaseFetchOptions, UserResolvable } from './UserManager.js';

export type GuildInviteResolvable = string;

export interface FetchInviteOptions extends BaseFetchOptions {
	code: InviteResolvable;
}

export interface FetchInvitesOptions {
	channelId?: GuildChannelResolvable;
	cache?: boolean;
}

export interface InviteCreateOptions {
	temporary?: boolean;
	maxAge?: number;
	maxUses?: number;
	unique?: boolean;
	targetUser?: UserResolvable;
	// biome-ignore lint/suspicious/noExplicitAny: target application resolvable
	targetApplication?: any;
	targetType?: InviteTargetType;
	reason?: string;
}

/**
 * Manages API methods for GuildInvites and stores their cache.
 *
 * @extends {CachedManager}
 */
export class GuildInviteManager extends CachedManager<string, GuildInvite, GuildInviteResolvable> {
	public guild: Guild;
	// biome-ignore lint/suspicious/noExplicitAny: iterable hydration
	constructor(guild: Guild, iterable?: Iterable<any>) {
		super(guild.client, GuildInvite, iterable);

		/**
		 * The guild this Manager belongs to
		 *
		 * @type {Guild}
		 */
		this.guild = guild;
	}

	// biome-ignore lint/suspicious/noExplicitAny: internal cache hydration
	override _add(data: any, cache?: boolean) {
		return super._add(data, cache, { id: data.code, extras: [this.guild] });
	}

	/**
	 * Fetches invite(s) from Discord.
	 *
	 * @param {GuildInviteResolvable|FetchInviteOptions|FetchInvitesOptions} [options]
	 * Options for fetching guild invite(s)
	 * @returns {Promise<GuildInvite|Collection<string, GuildInvite>>}
	 */
	async fetch(
		options?: InviteResolvable | FetchInviteOptions | FetchInvitesOptions,
	): Promise<GuildInvite | Collection<string, GuildInvite>> {
		if (!options) return this._fetchMany();
		if (typeof options === 'string') {
			const code = resolveInviteCode(options);
			if (!code) throw new DiscordjsError(ErrorCodes.InviteResolveCode);
			return this._fetchSingle({ code, cache: true });
		}

		const fetchOptions = options as FetchInviteOptions & FetchInvitesOptions;
		if (!fetchOptions.code) {
			if (fetchOptions.channelId) {
				const id = this.guild.channels.resolveId(fetchOptions.channelId);
				if (!id) throw new DiscordjsError(ErrorCodes.GuildChannelResolve);
				return this._fetchChannelMany(id, fetchOptions.cache);
			}

			if ('cache' in fetchOptions) return this._fetchMany(fetchOptions.cache);
			throw new DiscordjsError(ErrorCodes.InviteResolveCode);
		}

		return this._fetchSingle({
			...fetchOptions,
			code: resolveInviteCode(fetchOptions.code),
		});
	}

	// biome-ignore lint/suspicious/noExplicitAny: fetch helper
	async _fetchSingle({ code, cache, force = false }: any): Promise<GuildInvite> {
		if (!force) {
			const existing = this.cache.get(code);
			if (existing) return existing;
		}

		const invites = await this._fetchMany(cache);
		const invite = invites.get(code);
		if (!invite) throw new DiscordjsError(ErrorCodes.InviteNotFound);
		return invite;
	}

	// biome-ignore lint/suspicious/noExplicitAny: fetch helper
	async _fetchMany(cache?: boolean): Promise<Collection<string, GuildInvite>> {
		// biome-ignore lint/suspicious/noExplicitAny: guild invites REST response
		const data = (await this.client.rest.get(Routes.guildInvites(this.guild.id))) as any[];
		return data.reduce(
			// biome-ignore lint/suspicious/noExplicitAny: reducer accumulation
			(col: Collection<string, GuildInvite>, invite: any) => col.set(invite.code, this._add(invite, cache)),
			new Collection(),
		);
	}

	// biome-ignore lint/suspicious/noExplicitAny: fetch helper
	async _fetchChannelMany(channelId: Snowflake, cache?: boolean): Promise<Collection<string, GuildInvite>> {
		// biome-ignore lint/suspicious/noExplicitAny: channel invites REST response
		const data = (await this.client.rest.get(Routes.channelInvites(channelId))) as any[];
		return data.reduce(
			// biome-ignore lint/suspicious/noExplicitAny: reducer accumulation
			(col: Collection<string, GuildInvite>, invite: any) => col.set(invite.code, this._add(invite, cache)),
			new Collection(),
		);
	}

	/**
	 * Create an invite to the guild from the provided channel.
	 *
	 * @param {GuildChannelResolvable} channel The options for creating the invite from a channel.
	 * @param {InviteCreateOptions} [options={}] The options for creating the invite from a channel.
	 * @returns {Promise<GuildInvite>}
	 */
	async create(
		channel: GuildChannelResolvable,
		{ temporary, maxAge, maxUses, unique, targetUser, targetApplication, targetType, reason }: InviteCreateOptions = {},
	): Promise<GuildInvite> {
		const id = this.guild.channels.resolveId(channel);
		if (!id) throw new DiscordjsError(ErrorCodes.GuildChannelResolve);

		// biome-ignore lint/suspicious/noExplicitAny: post REST response
		const invite = (await this.client.rest.post(Routes.channelInvites(id), {
			body: {
				temporary,
				max_age: maxAge,
				max_uses: maxUses,
				unique,
				target_user_id: targetUser && this.client.users.resolveId(targetUser),
				target_application_id: targetApplication?.id ?? targetApplication?.applicationId ?? targetApplication,
				target_type: targetType,
			},
			reason,
		})) as any;
		return new GuildInvite(this.client, invite);
	}

	/**
	 * Deletes an invite.
	 *
	 * @param {InviteResolvable} invite The invite to delete
	 * @param {string} [reason] Reason for deleting the invite
	 * @returns {Promise<void>}
	 */
	async delete(invite: InviteResolvable, reason?: string): Promise<void> {
		const code = resolveInviteCode(invite);
		if (!code) throw new DiscordjsError(ErrorCodes.InviteResolveCode);
		await this.client.rest.delete(Routes.invite(code), { reason });
	}
}
