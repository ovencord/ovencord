import { Collection } from '@ovencord/collection';
import type { Snowflake } from 'discord-api-types/v10';
import { Routes } from 'discord-api-types/v10';
import { DiscordjsTypeError, ErrorCodes } from '../errors/index.js';
import type { Guild } from '../structures/Guild.js';
import { Role } from '../structures/Role.js';
import type { Base64Resolvable, BufferResolvable } from '../util/DataResolver.js';
import { resolveImage } from '../util/DataResolver.js';
import type { PermissionResolvable } from '../util/PermissionsBitField.js';
import { PermissionsBitField } from '../util/PermissionsBitField.js';
import { resolveColor, setPosition } from '../util/Util.js';
import { CachedManager } from './CachedManager.js';
import type { BaseFetchOptions, UserResolvable } from './UserManager.js';

export type RoleResolvable = Role | Snowflake | string;

export interface RolePosition {
	role: RoleResolvable;
	position: number;
}

let cacheWarningEmitted = false;

/**
 * Manages API methods for roles and stores their cache.
 *
 * @extends {CachedManager}
 */
export class RoleManager extends CachedManager<Snowflake, Role, RoleResolvable> {
	public guild: Guild;
	// biome-ignore lint/suspicious/noExplicitAny: iterable hydration
	constructor(guild: Guild, iterable?: Iterable<any>) {
		super(guild.client, Role, iterable);
		if (!cacheWarningEmitted && this._cache.constructor.name !== 'Collection') {
			cacheWarningEmitted = true;
			process.emitWarning(
				`Overriding the cache handling for ${this.constructor.name} is unsupported and breaks functionality.`,
				'UnsupportedCacheOverwriteWarning',
			);
		}

		/**
		 * The guild belonging to this manager
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
	 * Obtains a role from Discord, or the role cache if they're already available.
	 *
	 * @param {Snowflake} [id] The role's id
	 * @param {BaseFetchOptions} [options] Additional options for this fetch
	 * @returns {Promise<Role|Collection<Snowflake, Role>>}
	 */
	async fetch(
		id?: RoleResolvable,
		{ cache = true, force = false }: BaseFetchOptions = {},
	): Promise<Role | Collection<Snowflake, Role>> {
		if (!id) {
			// biome-ignore lint/suspicious/noExplicitAny: roles REST payload
			const innerData = (await this.client.rest.get(Routes.guildRoles(this.guild.id))) as any[];
			const roles = new Collection<Snowflake, Role>();
			for (const role of innerData) roles.set(role.id, this._add(role, cache));
			return roles;
		}

		const resolvedId = this.resolveId(id);
		if (!resolvedId) throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'id', 'RoleResolvable');
		if (!force) {
			const existing = this.cache.get(resolvedId);
			if (existing) return existing;
		}

		// biome-ignore lint/suspicious/noExplicitAny: roles REST payload
		const innerData = (await this.client.rest.get(Routes.guildRoles(this.guild.id))) as any[];
		const role = innerData.find((r) => r.id === resolvedId);
		if (!role) throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'role', 'RoleResolvable');
		return this._add(role, cache);
	}

	/**
	 * Fetches the member count of each role in the guild.
	 * <info>This does not include the `@everyone` role.</info>
	 *
	 * @returns {Promise<Collection<Snowflake, number>>} A collection mapping role ids to their respective member counts.
	 */
	async fetchMemberCounts() {
		const data = await this.client.rest.get(Routes.guildRoleMemberCounts(this.guild.id));
		return new Collection(Object.entries(data));
	}

	/**
	 * Data that can be resolved to a Role object. This can be:
	 * - A Role
	 * - A Snowflake
	 *
	 * @typedef {Role|Snowflake} RoleResolvable
	 */

	/**
	 * Resolves a {@link RoleResolvable} to a {@link Role} object.
	 *
	 * @method resolve
	 * @memberof RoleManager
	 * @instance
	 * @param {RoleResolvable} role The role resolvable to resolve
	 * @returns {?Role}
	 */

	/**
	 * Resolves a {@link RoleResolvable} to a {@link Role} id.
	 *
	 * @method resolveId
	 * @memberof RoleManager
	 * @instance
	 * @param {RoleResolvable} role The role resolvable to resolve
	 * @returns {?Snowflake}
	 */

	/**
	 * @typedef {Object} RoleColorsResolvable
	 * @property {ColorResolvable} primaryColor The primary color of the role
	 * @property {ColorResolvable} [secondaryColor] The secondary color of the role.
	 * This will make the role a gradient between the other provided colors
	 * @property {ColorResolvable} [tertiaryColor] The tertiary color of the role.
	 * When sending `tertiaryColor` the API enforces the role color to be a holographic style with values of `primaryColor = 11127295`, `secondaryColor = 16759788`, and `tertiaryColor = 16761760`.
	 * These values are available as a constant: `Constants.HolographicStyle`
	 */

	/**
	 * Options used to create a new role.
	 *
	 * @typedef {Object} RoleCreateOptions
	 * @property {string} [name] The name of the new role
	 * @property {RoleColorsResolvable} [colors] The colors to create the role with
	 * @property {boolean} [hoist] Whether or not the new role should be hoisted
	 * @property {PermissionResolvable} [permissions] The permissions for the new role
	 * @property {number} [position] The position of the new role
	 * @property {boolean} [mentionable] Whether or not the new role should be mentionable
	 * @property {?(BufferResolvable|Base64Resolvable|EmojiResolvable)} [icon] The icon for the role
	 * <warn>The `EmojiResolvable` should belong to the same guild as the role.
	 * If not, pass the emoji's URL directly</warn>
	 * @property {?string} [unicodeEmoji] The unicode emoji for the role
	 * @property {string} [reason] The reason for creating this role
	 */

	/**
	 * Creates a new role in the guild with given information.
	 * <warn>The position will silently reset to 1 if an invalid one is provided, or none.</warn>
	 *
	 * @param {RoleCreateOptions} [options] Options for creating the new role
	 * @returns {Promise<Role>}
	 * @example
	 * // Create a new role
	 * guild.roles.create()
	 *   .then(console.log)
	 *   .catch(console.error);
	 * @example
	 * // Create a new role with data and a reason
	 * guild.roles.create({
	 *   name: 'Super Cool Blue People',
	 *   reason: 'we needed a role for Super Cool People',
	 *   colors: {
	 *     primaryColor: Colors.Blue,
	 *   },
	 * })
	 *   .then(console.log)
	 *   .catch(console.error);
	 * @example
	 * // Create a role with holographic colors
	 * guild.roles.create({
	 *   name: 'Holographic Role',
	 *   reason: 'Creating a role with holographic effect',
	 *   colors: {
	 *     primaryColor: Constants.HolographicStyle.Primary,
	 *     secondaryColor: Constants.HolographicStyle.Secondary,
	 *     tertiaryColor: Constants.HolographicStyle.Tertiary,
	 *   },
	 * })
	 *   .then(console.log)
	 *   .catch(console.error);
	 */
	// biome-ignore lint/suspicious/noExplicitAny: role creation options
	async create(options: any = {}): Promise<Role> {
		let { permissions, icon } = options;
		const { name, hoist, position, mentionable, reason, unicodeEmoji } = options;
		if (permissions !== undefined) permissions = new PermissionsBitField(permissions);
		if (icon) {
			const guildEmojiURL = this.guild.emojis.resolve(icon)?.imageURL();
			icon = guildEmojiURL ? await resolveImage(guildEmojiURL) : await resolveImage(icon);
			if (typeof icon !== 'string') icon = undefined;
		}

		const colors = options.colors && {
			primary_color: resolveColor(options.colors.primaryColor),
			secondary_color: options.colors.secondaryColor && resolveColor(options.colors.secondaryColor),
			tertiary_color: options.colors.tertiaryColor && resolveColor(options.colors.tertiaryColor),
		};

		// biome-ignore lint/suspicious/noExplicitAny: post REST payload
		const data = (await this.client.rest.post(Routes.guildRoles(this.guild.id), {
			body: {
				name,
				colors,
				hoist,
				permissions,
				mentionable,
				icon,
				unicode_emoji: unicodeEmoji,
			},
			reason,
		})) as any;
		const { role } = this.client.actions.GuildRoleCreate.handle({
			guild_id: this.guild.id,
			role: data,
		});
		if (position) return this.setPosition(role, position, { reason });
		return role;
	}

	/**
	 * Options for editing a role
	 *
	 * @typedef {RoleData} RoleEditOptions
	 * @property {string} [reason] The reason for editing this role
	 */

	/**
	 * Edits a role of the guild.
	 *
	 * @param {RoleResolvable} role The role to edit
	 * @param {RoleEditOptions} options The options to provide
	 * @returns {Promise<Role>}
	 * @example
	 * // Edit a role
	 * guild.roles.edit('222079219327434752', { name: 'buddies' })
	 *   .then(updated => console.log(`Edited role name to ${updated.name}`))
	 *   .catch(console.error);
	 */
	// biome-ignore lint/suspicious/noExplicitAny: role edit options
	async edit(role: RoleResolvable, options: any): Promise<Role> {
		const resolvedRole = this.resolve(role);
		if (!resolvedRole) throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'role', 'RoleResolvable');

		if (typeof options.position === 'number') {
			await this.setPosition(resolvedRole, options.position, { reason: options.reason });
		}

		let icon = options.icon;
		if (icon) {
			const guildEmojiURL = this.guild.emojis.resolve(icon)?.imageURL();
			icon = guildEmojiURL ? await resolveImage(guildEmojiURL) : await resolveImage(icon);
			if (typeof icon !== 'string') icon = undefined;
		}

		const colors = options.colors && {
			primary_color: resolveColor(options.colors.primaryColor),
			secondary_color: options.colors.secondaryColor && resolveColor(options.colors.secondaryColor),
			tertiary_color: options.colors.tertiaryColor && resolveColor(options.colors.tertiaryColor),
		};

		const body = {
			name: options.name,
			colors,
			hoist: options.hoist,
			permissions: options.permissions === undefined ? undefined : new PermissionsBitField(options.permissions),
			mentionable: options.mentionable,
			icon,
			unicode_emoji: options.unicodeEmoji,
		};

		// biome-ignore lint/suspicious/noExplicitAny: role patch response
		const data = (await this.client.rest.patch(Routes.guildRole(this.guild.id, resolvedRole.id), {
			body,
			reason: options.reason,
		})) as any;

		const clone = resolvedRole._clone();
		clone._patch(data);
		return clone;
	}

	/**
	 * Deletes a role.
	 *
	 * @param {RoleResolvable} role The role to delete
	 * @param {string} [reason] Reason for deleting the role
	 * @returns {Promise<void>}
	 */
	async delete(role: RoleResolvable, reason?: string): Promise<void> {
		const id = this.resolveId(role);
		if (!id) throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'role', 'RoleResolvable');
		await this.client.rest.delete(Routes.guildRole(this.guild.id, id), { reason });
		this.client.actions.GuildRoleDelete.handle({ guild_id: this.guild.id, role_id: id });
	}

	/**
	 * Sets the new position of the role.
	 *
	 * @param {RoleResolvable} role The role to change the position of
	 * @param {number} position The new position for the role
	 * @param {Object} [options] Options for setting the position
	 * @returns {Promise<Role>}
	 */
	async setPosition(
		role: RoleResolvable,
		position: number,
		{ relative, reason }: { relative?: boolean; reason?: string } = {},
	): Promise<Role> {
		const resolvedRole = this.resolve(role);
		if (!resolvedRole) throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'role', 'RoleResolvable');
		const updatedRoles = await setPosition(
			resolvedRole,
			position,
			relative,
			this.guild._sortedRoles(),
			this.client,
			Routes.guildRoles(this.guild.id),
			reason,
		);

		this.client.actions.GuildRolesPositionUpdate.handle({
			guild_id: this.guild.id,
			roles: updatedRoles,
		});
		return resolvedRole;
	}

	/**
	 * Batch-updates the guild's role positions
	 *
	 * @param {RolePosition[]} rolePositions Role positions to update
	 * @returns {Promise<Guild>}
	 */
	async setPositions(rolePositions: RolePosition[]): Promise<Guild> {
		const resolvedRolePositions = rolePositions.map((rolePosition) => ({
			id: this.resolveId(rolePosition.role),
			position: rolePosition.position,
		}));

		await this.client.rest.patch(Routes.guildRoles(this.guild.id), { body: resolvedRolePositions });
		return this.client.actions.GuildRolesPositionUpdate.handle({
			guild_id: this.guild.id,
			roles: resolvedRolePositions,
		}).guild;
	}

	/**
	 * Compares the positions of two roles.
	 *
	 * @param {RoleResolvable} role1 First role to compare
	 * @param {RoleResolvable} role2 Second role to compare
	 * @returns {number}
	 */
	comparePositions(role1: RoleResolvable, role2: RoleResolvable): number {
		const resolvedRole1 = this.resolve(role1);
		const resolvedRole2 = this.resolve(role2);
		if (!resolvedRole1 || !resolvedRole2) {
			throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'role', 'Role nor a Snowflake');
		}

		const role1Position = resolvedRole1.position;
		const role2Position = resolvedRole2.position;

		if (role1Position === role2Position) {
			return Number(BigInt(resolvedRole2.id) - BigInt(resolvedRole1.id));
		}

		return role1Position - role2Position;
	}

	/**
	 * Gets the managed role a user created when joining the guild, if any
	 * <info>Only ever available for bots</info>
	 *
	 * @param {UserResolvable} user The user to access the bot role for
	 * @returns {?Role}
	 */
	botRoleFor(user: UserResolvable): Role | null {
		const userId = this.client.users.resolveId(user);
		if (!userId) return null;
		return this.cache.find((role) => role.tags?.botId === userId) ?? null;
	}

	/**
	 * The `@everyone` role of the guild
	 *
	 * @type {Role}
	 * @readonly
	 */
	get everyone(): Role | undefined {
		return this.cache.get(this.guild.id);
	}

	/**
	 * The premium subscriber role of the guild, if any
	 *
	 * @type {?Role}
	 * @readonly
	 */
	get premiumSubscriberRole(): Role | null {
		return this.cache.find((role) => Boolean(role.tags?.premiumSubscriberRole)) ?? null;
	}

	/**
	 * The role with the highest position in the cache
	 *
	 * @type {Role}
	 * @readonly
	 */
	get highest(): Role | undefined {
		return this.cache.reduce(
			// biome-ignore lint/suspicious/noExplicitAny: reduce comparison
			(prev: any, role: any) => (role.comparePositionTo(prev) > 0 ? role : prev),
			this.cache.first(),
		);
	}
}
