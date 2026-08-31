import { Collection } from '@ovencord/collection';
import type { Snowflake } from 'discord-api-types/v10';
import { DiscordjsTypeError, ErrorCodes } from '../errors/index.js';
import type { Guild } from '../structures/Guild.js';
import type { GuildEmoji } from '../structures/GuildEmoji.js';
import { Role } from '../structures/Role.js';
import { DataManager } from './DataManager.js';
import type { RoleResolvable } from './RoleManager.js';

/**
 * Manages API methods for roles belonging to emojis and stores their cache.
 *
 * @extends {DataManager}
 */
export class GuildEmojiRoleManager extends DataManager<Snowflake, Role, RoleResolvable> {
	public emoji: GuildEmoji;
	public guild: Guild;
	constructor(emoji: GuildEmoji) {
		super(emoji.client, Role);

		/**
		 * The emoji belonging to this manager
		 *
		 * @type {GuildEmoji}
		 */
		this.emoji = emoji;
		/**
		 * The guild belonging to this manager
		 *
		 * @type {Guild}
		 */
		this.guild = emoji.guild;
	}

	/**
	 * The cache of roles belonging to this emoji
	 *
	 * @type {Collection<Snowflake, Role>}
	 * @readonly
	 */
	override get cache(): Collection<Snowflake, Role> {
		const cache = new Collection<Snowflake, Role>();
		// biome-ignore lint/suspicious/noExplicitAny: internal roles list
		for (const roleId of (this.emoji as any)._roles ?? []) {
			const role = this.guild.roles.cache.get(roleId);
			if (role !== undefined) {
				cache.set(roleId, role);
			}
		}

		return cache;
	}

	/**
	 * Adds a role (or multiple roles) to the list of roles that can use this emoji.
	 *
	 * @param {RoleResolvable|RoleResolvable[]|Collection<Snowflake, Role>} roleOrRoles The role or roles to add
	 * @returns {Promise<GuildEmoji>}
	 */
	async add(roleOrRoles: RoleResolvable | RoleResolvable[] | Collection<Snowflake, Role>): Promise<GuildEmoji> {
		const roles = Array.isArray(roleOrRoles) || roleOrRoles instanceof Collection ? roleOrRoles : [roleOrRoles];

		const resolvedRoleIds: Snowflake[] = [];
		for (const role of roles as Iterable<RoleResolvable>) {
			const roleId = this.guild.roles.resolveId(role);
			if (!roleId) {
				throw new DiscordjsTypeError(ErrorCodes.InvalidElement, 'Array or Collection', 'roles', role);
			}

			resolvedRoleIds.push(roleId);
		}

		const newRoles = [...new Set(resolvedRoleIds.concat(...this.cache.keys()))];
		return this.set(newRoles);
	}

	/**
	 * Removes a role (or multiple roles) from the list of roles that can use this emoji.
	 *
	 * @param {RoleResolvable|RoleResolvable[]|Collection<Snowflake, Role>} roleOrRoles The role or roles to remove
	 * @returns {Promise<GuildEmoji>}
	 */
	async remove(roleOrRoles: RoleResolvable | RoleResolvable[] | Collection<Snowflake, Role>): Promise<GuildEmoji> {
		const roles = Array.isArray(roleOrRoles) || roleOrRoles instanceof Collection ? roleOrRoles : [roleOrRoles];

		const resolvedRoleIds: Snowflake[] = [];
		for (const role of roles as Iterable<RoleResolvable>) {
			const roleId = this.guild.roles.resolveId(role);
			if (!roleId) {
				throw new DiscordjsTypeError(ErrorCodes.InvalidElement, 'Array or Collection', 'roles', role);
			}

			resolvedRoleIds.push(roleId);
		}

		const newRoles = [...this.cache.keys()].filter((id) => !resolvedRoleIds.includes(id));
		return this.set(newRoles);
	}

	/**
	 * Sets the role(s) that can use this emoji.
	 *
	 * @param {Collection<Snowflake, Role>|RoleResolvable[]} roles The roles or role ids to apply
	 * @returns {Promise<GuildEmoji>}
	 */
	async set(roles: Collection<Snowflake, Role> | readonly RoleResolvable[]): Promise<GuildEmoji> {
		return this.emoji.edit({ roles });
	}

	clone() {
		// biome-ignore lint/suspicious/noExplicitAny: constructor dynamic instantiation
		const clone = new (this.constructor as any)(this.emoji);
		clone._patch([...this.cache.keys()]);
		return clone;
	}

	/**
	 * Patches the roles for this manager's cache
	 *
	 * @param {Snowflake[]} roles The new roles
	 * @private
	 */
	_patch(roles: Snowflake[]) {
		// biome-ignore lint/suspicious/noExplicitAny: internal roles list
		(this.emoji as any)._roles = roles;
	}

	override valueOf(): Collection<Snowflake, Role> {
		return this.cache;
	}
}
