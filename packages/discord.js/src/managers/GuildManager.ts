import { Collection } from '@ovencord/collection';
import { makeURLSearchParams } from '@ovencord/rest';
import { type APIGuild, GatewayOpcodes, RouteBases, Routes, type Snowflake } from 'discord-api-types/v10';
import type { Client } from '../client/Client.js';
import { DiscordjsError, ErrorCodes } from '../errors/index.js';
import { ShardClientUtil } from '../sharding/ShardClientUtil.js';
import { Guild } from '../structures/Guild.js';
import { GuildChannel } from '../structures/GuildChannel.js';
import { GuildEmoji } from '../structures/GuildEmoji.js';
import { GuildInvite } from '../structures/GuildInvite.js';
import { GuildMember } from '../structures/GuildMember.js';
import { OAuth2Guild } from '../structures/OAuth2Guild.js';
import { Role } from '../structures/Role.js';
import { Events } from '../util/Events.js';
import { _transformAPIIncidentsData } from '../util/Transformers.js';
import { CachedManager } from './CachedManager.js';

let cacheWarningEmitted = false;

/**
 * Data that resolves to give a Guild object. This can be:
 * - A Guild object
 * - A GuildChannel object
 * - A GuildMember object
 * - A GuildEmoji object
 * - A Role object
 * - A Snowflake
 * - An Invite object
 */
export type GuildResolvable = Guild | GuildChannel | GuildMember | GuildEmoji | Role | Snowflake | GuildInvite;

/**
 * Options used to fetch a single guild.
 */
export interface FetchGuildOptions {
	/** The guild to fetch */
	guild?: GuildResolvable;
	/** Whether the approximate member and presence counts should be returned */
	withCounts?: boolean;
	/** Whether to skip the cache and fetch from the API */
	force?: boolean;
	/** Whether to cache the fetched guild */
	cache?: boolean;
}

/**
 * Options used to fetch multiple guilds.
 */
export interface FetchGuildsOptions {
	/** Get guilds before this guild id */
	before?: Snowflake;
	/** Get guilds after this guild id */
	after?: Snowflake;
	/** Maximum number of guilds to request (1-200) */
	limit?: number;
}

/**
 * Options for fetching soundboard sounds
 */
export interface FetchSoundboardSoundsOptions {
	/** The ids of the guilds to fetch soundboard sounds for */
	guildIds: Snowflake[];
	/** The timeout for receipt of the soundboard sounds */
	time?: number;
}

/**
 * Manages API methods for Guilds and stores their cache.
 *
 * @extends {CachedManager}
 */
export class GuildManager extends CachedManager {
	constructor(client: Client, iterable?: Iterable<APIGuild>) {
		super(client, Guild, iterable);
		if (!cacheWarningEmitted && (this._cache as any).constructor.name !== 'Collection') {
			cacheWarningEmitted = true;
			process.emitWarning(
				`Overriding the cache handling for ${this.constructor.name} is unsupported and breaks functionality.`,
				'UnsupportedCacheOverwriteWarning',
			);
		}
	}

	/**
	 * The cache of this Manager
	 *
	 * @type {Collection<Snowflake, Guild>}
	 * @name GuildManager#cache
	 */

	/**
	 * Resolves a {@link GuildResolvable} to a {@link Guild} object.
	 *
	 * @param {GuildResolvable} guild The guild resolvable to identify
	 * @returns {?Guild}
	 */
	override resolve(guild: GuildResolvable | any): Guild | null {
		if (
			guild instanceof GuildChannel ||
			guild instanceof GuildMember ||
			guild instanceof GuildEmoji ||
			guild instanceof Role ||
			(guild instanceof GuildInvite && guild.guild)
		) {
			return super.resolve((guild as any).guild as GuildResolvable);
		}

		return super.resolve(guild);
	}

	/**
	 * Resolves a {@link GuildResolvable} to a {@link Guild} id string.
	 *
	 * @param {GuildResolvable} guild The guild resolvable to identify
	 * @returns {?Snowflake}
	 */
	override resolveId(guild: GuildResolvable | any): Snowflake | null {
		if (
			guild instanceof GuildChannel ||
			guild instanceof GuildMember ||
			guild instanceof GuildEmoji ||
			guild instanceof Role ||
			(guild instanceof GuildInvite && guild.guild)
		) {
			return super.resolveId((guild as any).guild.id);
		}

		return super.resolveId(guild);
	}

	/**
	 * Obtains one or multiple guilds from Discord, or the guild cache if it's already available.
	 *
	 * @param {GuildResolvable|FetchGuildOptions|FetchGuildsOptions} [options] The guild's id or options
	 * @returns {Promise<Guild|Collection<Snowflake, OAuth2Guild>>}
	 */
	async fetch(options: GuildResolvable | FetchGuildOptions | FetchGuildsOptions | any = {}) {
		const id = this.resolveId(options) ?? this.resolveId(options.guild);

		if (id) {
			if (!options.force) {
				const existing = this.cache.get(id);
				if (existing) return existing as Guild;
			}

			const innerData = (await this.client.rest.get(Routes.guild(id), {
				query: makeURLSearchParams({ with_counts: options.withCounts ?? true }),
			})) as any;
			innerData.shardId = ShardClientUtil.shardIdForGuildId(id, await this.client.ws.getShardCount());
			return this._add(innerData, options.cache) as Guild;
		}

		const data = (await this.client.rest.get(Routes.userGuilds(), { query: makeURLSearchParams(options) })) as any[];
		return data.reduce(
			(coll: Collection<Snowflake, OAuth2Guild>, guild: any) => coll.set(guild.id, new OAuth2Guild(this.client, guild)),
			new Collection<Snowflake, OAuth2Guild>(),
		);
	}

	/**
	 * Fetches soundboard sounds for the specified guilds.
	 *
	 * @param {FetchSoundboardSoundsOptions} options The options for fetching soundboard sounds
	 * @returns {Promise<Collection<Snowflake, Collection<Snowflake, SoundboardSound>>>}
	 */
	async fetchSoundboardSounds({ guildIds, time = 10_000 }: FetchSoundboardSoundsOptions) {
		const shardCount = await this.client.ws.getShardCount();
		const shardIds = Map.groupBy(guildIds, (guildId: Snowflake) =>
			ShardClientUtil.shardIdForGuildId(guildId, shardCount),
		);

		for (const [shardId, shardGuildIds] of shardIds) {
			(this.client.ws as any).send(shardId, {
				op: GatewayOpcodes.RequestSoundboardSounds,
				d: {
					guild_ids: shardGuildIds,
				},
			});
		}

		return new Promise<Collection<Snowflake, Collection<Snowflake, any>>>((resolve, reject) => {
			const remainingGuildIds = new Set(guildIds);

			const fetchedSoundboardSounds = new Collection<Snowflake, Collection<Snowflake, any>>();

			const handler = (soundboardSounds: Collection<Snowflake, any>, guild: Guild) => {
				timeout.refresh();

				if (!remainingGuildIds.has(guild.id)) return;

				fetchedSoundboardSounds.set(guild.id, soundboardSounds);

				remainingGuildIds.delete(guild.id);

				if (remainingGuildIds.size === 0) {
					clearTimeout(timeout);
					this.client.removeListener(Events.SoundboardSounds, handler as any);
					(this.client as any).decrementMaxListeners();

					resolve(fetchedSoundboardSounds);
				}
			};

			const timeout = setTimeout(() => {
				this.client.removeListener(Events.SoundboardSounds, handler as any);
				(this.client as any).decrementMaxListeners();
				reject(new DiscordjsError(ErrorCodes.GuildSoundboardSoundsTimeout));
			}, time).unref();

			(this.client as any).incrementMaxListeners();
			this.client.on(Events.SoundboardSounds, handler as any);
		});
	}

	/**
	 * Sets the incident actions for a guild.
	 *
	 * @param {GuildResolvable} guild The guild
	 * @param {Object} incidentActions The incident actions to set
	 * @returns {Promise<IncidentActions>}
	 */
	async setIncidentActions(
		guild: GuildResolvable | any,
		{
			invitesDisabledUntil,
			dmsDisabledUntil,
		}: { invitesDisabledUntil?: Date | string | number | null; dmsDisabledUntil?: Date | string | number | null },
	) {
		const guildId = this.resolveId(guild);
		if (!guildId) throw new Error('Invalid guild');

		const data = (await this.client.rest.put(Routes.guildIncidentActions(guildId), {
			body: {
				invites_disabled_until: invitesDisabledUntil && new Date(invitesDisabledUntil).toISOString(),
				dms_disabled_until: dmsDisabledUntil && new Date(dmsDisabledUntil).toISOString(),
			},
		})) as any;

		const parsedData = _transformAPIIncidentsData(data);
		const resolvedGuild = this.resolve(guild) as any;

		if (resolvedGuild) {
			resolvedGuild.incidentsData = parsedData;
		}

		return parsedData;
	}

	/**
	 * Returns a URL for the PNG widget of a guild.
	 *
	 * @param {GuildResolvable} guild The guild of the widget image
	 * @param {string} [style] The style for the widget image
	 * @returns {string}
	 */
	widgetImageURL(guild: GuildResolvable | any, style?: string) {
		const guildId = this.resolveId(guild);
		if (!guildId) throw new Error('Invalid guild');
		const urlSearchParams = String(makeURLSearchParams({ style }));

		return `${RouteBases.api}${Routes.guildWidgetImage(guildId)}${urlSearchParams ? `?${urlSearchParams}` : ''}`;
	}
}
