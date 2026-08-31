import { Collection } from '@ovencord/collection';
import type { Snowflake } from 'discord-api-types/v10';
import { PermissionFlagsBits, Routes } from 'discord-api-types/v10';
import { DiscordjsError, DiscordjsTypeError, ErrorCodes } from '../errors/index.js';
import { ApplicationEmoji } from '../structures/ApplicationEmoji.js';
import type { Guild } from '../structures/Guild.js';
import { GuildEmoji } from '../structures/GuildEmoji.js';
import { ReactionEmoji } from '../structures/ReactionEmoji.js';
import type { Role } from '../structures/Role.js';
import type { User } from '../structures/User.js';
import type { Base64Resolvable, BufferResolvable } from '../util/DataResolver.js';
import { resolveImage } from '../util/DataResolver.js';
import { parseEmoji } from '../util/Util.js';
import { CachedManager } from './CachedManager.js';
import type { RoleResolvable } from './RoleManager.js';
import type { BaseFetchOptions } from './UserManager.js';

export type EmojiResolvable = Snowflake | GuildEmoji | ReactionEmoji | ApplicationEmoji | string;
export type EmojiIdentifierResolvable = string | EmojiResolvable;

export interface GuildEmojiCreateOptions {
	attachment: BufferResolvable | Base64Resolvable;
	name: string;
	roles?: Collection<Snowflake, Role> | RoleResolvable[];
	reason?: string;
}

export interface GuildEmojiEditOptions {
	name?: string;
	roles?: Collection<Snowflake, Role> | readonly RoleResolvable[];
	reason?: string;
}

/**
 * Manages API methods for GuildEmojis and stores their cache.
 *
 * @extends {CachedManager}
 */
export class GuildEmojiManager extends CachedManager<Snowflake, GuildEmoji, EmojiResolvable> {
	public guild: Guild;
	// biome-ignore lint/suspicious/noExplicitAny: iterable hydration
	constructor(guild: Guild, iterable?: Iterable<any>) {
		super(guild.client, GuildEmoji, iterable);

		/**
		 * The guild this manager belongs to
		 *
		 * @type {Guild}
		 */
		this.guild = guild;
	}

	// biome-ignore lint/suspicious/noExplicitAny: internal cache hydration
	override _add(data: any, cache?: boolean) {
		return super._add(data, cache, { extras: [this.guild] });
	}

	/**
	 * Resolves an EmojiResolvable to an Emoji object.
	 *
	 * @param {EmojiResolvable} emoji The Emoji resolvable to identify
	 * @returns {?GuildEmoji}
	 */
	override resolve(emoji: EmojiResolvable | null | undefined): GuildEmoji | null {
		if (emoji instanceof ReactionEmoji) return super.cache.get(emoji.id as Snowflake) ?? null;
		if (emoji instanceof ApplicationEmoji) return super.cache.get(emoji.id) ?? null;
		return super.resolve(emoji);
	}

	/**
	 * Resolves an EmojiResolvable to an Emoji id string.
	 *
	 * @param {EmojiResolvable} emoji The Emoji resolvable to identify
	 * @returns {?Snowflake}
	 */
	override resolveId(emoji: EmojiResolvable | null | undefined): Snowflake | null {
		if (emoji instanceof ReactionEmoji) return emoji.id;
		if (emoji instanceof ApplicationEmoji) return emoji.id;
		return super.resolveId(emoji);
	}

	/**
	 * Resolves an EmojiResolvable to an emoji identifier.
	 *
	 * @param {EmojiIdentifierResolvable} emoji The emoji resolvable to resolve
	 * @returns {?string}
	 */
	resolveIdentifier(emoji: EmojiIdentifierResolvable): string | null {
		const emojiResolvable = this.resolve(emoji);
		if (emojiResolvable) return emojiResolvable.identifier;
		if (emoji instanceof ReactionEmoji) return emoji.identifier;
		if (emoji instanceof ApplicationEmoji) return emoji.identifier;
		if (typeof emoji === 'string') {
			const res = parseEmoji(emoji);
			let identifier = emoji;
			if (res?.name.length) {
				identifier = `${res.animated ? 'a:' : ''}${res.name}${res.id ? `:${res.id}` : ''}`;
			}

			if (!identifier.includes('%')) return encodeURIComponent(identifier);
			return identifier;
		}

		return null;
	}

	/**
	 * Creates a new custom emoji in the guild.
	 *
	 * @param {GuildEmojiCreateOptions} options Options for creating the emoji
	 * @returns {Promise<GuildEmoji>} The created emoji
	 */
	async create({ attachment, name, roles, reason }: GuildEmojiCreateOptions): Promise<GuildEmoji> {
		const image = await resolveImage(attachment);
		if (!image) throw new DiscordjsTypeError(ErrorCodes.ReqResourceType);

		const body: { image: string; name: string; roles?: Snowflake[] } = { image, name };
		if (roles) {
			if (!Array.isArray(roles) && !(roles instanceof Collection)) {
				throw new DiscordjsTypeError(
					ErrorCodes.InvalidType,
					'options.roles',
					'Array or Collection of Roles or Snowflakes',
					true,
				);
			}

			body.roles = [];
			for (const role of roles.values()) {
				const resolvedRole = this.guild.roles.resolveId(role);
				if (!resolvedRole) {
					throw new DiscordjsTypeError(ErrorCodes.InvalidElement, 'Array or Collection', 'options.roles', role);
				}

				body.roles.push(resolvedRole);
			}
		}

		// biome-ignore lint/suspicious/noExplicitAny: post REST payload
		const emoji = (await this.client.rest.post(Routes.guildEmojis(this.guild.id), { body, reason })) as any;
		return this.client.actions.GuildEmojiCreate.handle(this.guild, emoji).emoji;
	}

	/**
	 * Obtains one or more emojis from Discord, or the emoji cache if they're already available.
	 *
	 * @param {Snowflake} [id] The emoji's id
	 * @param {BaseFetchOptions} [options] Additional options for this fetch
	 * @returns {Promise<GuildEmoji|Collection<Snowflake, GuildEmoji>>}
	 */
	async fetch(
		id?: Snowflake,
		{ cache = true, force = false }: BaseFetchOptions = {},
	): Promise<GuildEmoji | Collection<Snowflake, GuildEmoji>> {
		if (id) {
			if (!force) {
				const existing = this.cache.get(id);
				if (existing) return existing;
			}

			// biome-ignore lint/suspicious/noExplicitAny: emoji REST response
			const emoji = (await this.client.rest.get(Routes.guildEmoji(this.guild.id, id))) as any;
			return this._add(emoji, cache);
		}

		// biome-ignore lint/suspicious/noExplicitAny: emojis REST response
		const data = (await this.client.rest.get(Routes.guildEmojis(this.guild.id))) as any[];
		const emojis = new Collection<Snowflake, GuildEmoji>();
		for (const emoji of data) emojis.set(emoji.id, this._add(emoji, cache));
		return emojis;
	}

	/**
	 * Deletes an emoji.
	 *
	 * @param {EmojiResolvable} emoji The Emoji resolvable to delete
	 * @param {string} [reason] Reason for deleting the emoji
	 * @returns {Promise<void>}
	 */
	async delete(emoji: EmojiResolvable, reason?: string): Promise<void> {
		const id = this.resolveId(emoji);
		if (!id) throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'emoji', 'EmojiResolvable', true);
		await this.client.rest.delete(Routes.guildEmoji(this.guild.id, id), { reason });
	}

	/**
	 * Edits an emoji.
	 *
	 * @param {EmojiResolvable} emoji The Emoji resolvable to edit
	 * @param {GuildEmojiEditOptions} options The options to provide
	 * @returns {Promise<GuildEmoji>}
	 */
	async edit(emoji: EmojiResolvable, options: GuildEmojiEditOptions): Promise<GuildEmoji> {
		const id = this.resolveId(emoji);
		if (!id) throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'emoji', 'EmojiResolvable', true);
		const roles =
			options.roles && [...options.roles.values()].map((role) => this.guild.roles.resolveId(role) as Snowflake);
		// biome-ignore lint/suspicious/noExplicitAny: patch REST payload
		const newData = (await this.client.rest.patch(Routes.guildEmoji(this.guild.id, id), {
			body: {
				name: options.name,
				roles,
			},
			reason: options.reason,
		})) as any;
		const existing = this.cache.get(id);
		if (existing) {
			const clone = existing._clone();
			clone._patch(newData);
			return clone;
		}

		return this._add(newData);
	}

	/**
	 * Fetches the author for this emoji
	 *
	 * @param {EmojiResolvable} emoji The emoji to fetch the author of
	 * @returns {Promise<User|null>}
	 */
	async fetchAuthor(emoji: EmojiResolvable): Promise<User | null> {
		const resolvedEmoji = this.resolve(emoji);
		if (!resolvedEmoji) throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'emoji', 'EmojiResolvable', true);
		if (resolvedEmoji.managed) {
			throw new DiscordjsError(ErrorCodes.EmojiManaged);
		}

		const { me } = this.guild.members;
		if (!me) throw new DiscordjsError(ErrorCodes.GuildUncachedMe);
		if (!me.permissions.any(PermissionFlagsBits.CreateGuildExpressions | PermissionFlagsBits.ManageGuildExpressions)) {
			throw new DiscordjsError(ErrorCodes.MissingGuildExpressionsPermission, this.guild);
		}

		// biome-ignore lint/suspicious/noExplicitAny: emoji REST response
		const data = (await this.client.rest.get(Routes.guildEmoji(this.guild.id, resolvedEmoji.id))) as any;
		resolvedEmoji._patch(data);
		return resolvedEmoji.author;
	}
}
