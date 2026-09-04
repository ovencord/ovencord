import { Collection } from '@ovencord/collection';
import { makeURLSearchParams } from '@ovencord/rest';
import { isJSONEncodable } from '@ovencord/util';
import {
	type APIApplicationCommand,
	type RESTPatchAPIApplicationCommandJSONBody,
	Routes,
	type Snowflake,
} from 'discord-api-types/v10';
import type { Client } from '../client/Client.js';
import { DiscordjsTypeError, ErrorCodes } from '../errors/index.js';
import { ApplicationCommand } from '../structures/ApplicationCommand.js';
import type { Guild } from '../structures/Guild.js';
import { PermissionsBitField } from '../util/PermissionsBitField.js';
import { ApplicationCommandPermissionsManager } from './ApplicationCommandPermissionsManager.js';
import { CachedManager } from './CachedManager.js';

/**
 * Manages API methods for application commands and stores their cache.
 *
 * @extends {CachedManager}
 */
export class ApplicationCommandManager extends CachedManager<Snowflake, ApplicationCommand, typeof ApplicationCommand> {
	public permissions: ApplicationCommandPermissionsManager;
	public guild: Guild | null = null; // Add guild property since subclasses use it
	constructor(client: Client, iterable?: Iterable<ApplicationCommand>) {
		super(client, ApplicationCommand, iterable);

		/**
		 * The manager for permissions of arbitrary commands on arbitrary guilds
		 *
		 * @type {ApplicationCommandPermissionsManager}
		 */
		this.permissions = new ApplicationCommandPermissionsManager(this);
	}

	/**
	 * The cache of this manager
	 *
	 * @type {Collection<Snowflake, ApplicationCommand>}
	 * @name ApplicationCommandManager#cache
	 */

	// biome-ignore lint/suspicious/noExplicitAny: internal lifecycle method accepts heterogeneous payloads (API data, existing structure, or partial patch)
	_add(data: any, cache?: boolean, guildId?: Snowflake) {
		return super._add(data, cache, { extras: [this.guild, guildId] });
	}

	/**
	 * The APIRouter path to the commands
	 *
	 * @param {Object} [options] The options
	 * @param {Snowflake} [options.id] The application command's id
	 * @param {Snowflake} [options.guildId] The guild's id to use in the path,
	 * ignored when using a {@link GuildApplicationCommandManager}
	 * @returns {string}
	 * @private
	 */
	commandPath({ id, guildId }: { id?: Snowflake; guildId?: Snowflake } = {}) {
		const targetGuildId = this.guild?.id ?? guildId;
		if (targetGuildId) {
			if (id) {
				return Routes.applicationGuildCommand(this.client.application.id, targetGuildId, id);
			}

			return Routes.applicationGuildCommands(this.client.application.id, targetGuildId);
		}

		if (id) {
			return Routes.applicationCommand(this.client.application.id, id);
		}

		return Routes.applicationCommands(this.client.application.id);
	}

	/**
	 * Data that can be resolved to a Command. This can be:
	 * * A Command
	 * * A Snowflake
	 *
	 * @typedef {ApplicationCommand|Snowflake} ApplicationCommandResolvable
	 */

	/**
	 * Options for fetching a single command
	 *
	 * @typedef {BaseFetchOptions} FetchApplicationCommandOptions
	 * @property {Snowflake} [guildId] The guild's id to fetch this command from,
	 * ignored when using a {@link GuildApplicationCommandManager}
	 */

	/**
	 * Options for fetching multiple commands
	 *
	 * @typedef {Object} FetchApplicationCommandsOptions
	 * @property {Snowflake} [guildId] The guild's id to fetch commands from,
	 * ignored when using a {@link GuildApplicationCommandManager}
	 * @property {string} [locale] The target locale to fetch localized names and descriptions for
	 * @property {boolean} [withLocalizations] Whether to also retrieve all localizations for each command
	 */

	/**
	 * Fetches applications commands from the API.
	 *
	 * @param {ApplicationCommandResolvable|FetchApplicationCommandOptions|FetchApplicationCommandsOptions} [options]
	 * The options for fetching the commands
	 * @returns {Promise<ApplicationCommand|Collection<Snowflake, ApplicationCommand>>}
	 * @example
	 * // Fetch all commands
	 * guild.commands.fetch()
	 *   .then(commands => console.log(`Fetched ${commands.size} commands`))
	 *   .catch(console.error);
	 * @example
	 * // Fetch a single command
	 * guild.commands.fetch('123456789012345678')
	 *   .then(command => console.log(`Fetched command ${command.name}`))
	 *   .catch(console.error);
	 * @example
	 * // Fetch a single command without checking cache
	 * guild.commands.fetch({ id: '123456789012345678', force: true })
	 *   .then(command => console.log(`Fetched command ${command.name}`))
	 *   .catch(console.error);
	 */
	async fetch(options?: unknown) {
		if (!options) return this._fetchMany();

		if (typeof options === 'string') return this._fetchSingle({ id: options });

		const { cache, force, guildId, id, locale, withLocalizations } = options as {
			cache?: boolean;
			force?: boolean;
			guildId?: Snowflake;
			id?: Snowflake;
			locale?: string;
			withLocalizations?: boolean;
		};

		if (id) return this._fetchSingle({ cache, force, guildId, id });

		return this._fetchMany({ cache, guildId, locale, withLocalizations });
	}

	async _fetchSingle({
		cache,
		force = false,
		guildId,
		id,
	}: {
		cache?: boolean;
		force?: boolean;
		guildId?: Snowflake;
		id: Snowflake;
	}) {
		if (!force) {
			const existing = this.cache.get(id);
			if (existing) return existing;
		}

		const command = await this.client.rest.get(this.commandPath({ id, guildId }));
		return this._add(command, cache, guildId);
	}

	async _fetchMany({
		cache,
		guildId,
		locale,
		withLocalizations,
	}: {
		cache?: boolean;
		guildId?: Snowflake;
		locale?: string;
		withLocalizations?: boolean;
	} = {}) {
		const data = (await this.client.rest.get(this.commandPath({ guildId }), {
			headers: {
				'X-Discord-Locale': locale,
			},
			query: makeURLSearchParams({ with_localizations: withLocalizations }),
		})) as APIApplicationCommand[];

		return data.reduce(
			(coll: Collection<Snowflake, ApplicationCommand>, command: APIApplicationCommand) =>
				coll.set(command.id, this._add(command, cache, guildId)),
			new Collection<Snowflake, ApplicationCommand>(),
		);
	}

	/**
	 * Creates an application command.
	 *
	 * @param {ApplicationCommandDataResolvable} command The command
	 * @param {Snowflake} [guildId] The guild's id to create this command in,
	 * ignored when using a {@link GuildApplicationCommandManager}
	 * @returns {Promise<ApplicationCommand>}
	 * @example
	 * // Create a new command
	 * client.application.commands.create({
	 *   name: 'test',
	 *   description: 'A test command',
	 * })
	 *   .then(console.log)
	 *   .catch(console.error);
	 */
	async create(command: unknown, guildId?: Snowflake) {
		const data = await this.client.rest.post(this.commandPath({ guildId }), {
			body: (this.constructor as typeof ApplicationCommandManager).transformCommand(command),
		});
		return this._add(data, true, guildId);
	}

	/**
	 * Sets all the commands for this application or guild.
	 *
	 * @param {ApplicationCommandDataResolvable[]} commands The commands
	 * @param {Snowflake} [guildId] The guild's id to create the commands in,
	 * ignored when using a {@link GuildApplicationCommandManager}
	 * @returns {Promise<Collection<Snowflake, ApplicationCommand>>}
	 * @example
	 * // Set all commands to just this one
	 * client.application.commands.set([
	 *   {
	 *     name: 'test',
	 *     description: 'A test command',
	 *   },
	 * ])
	 *   .then(console.log)
	 *   .catch(console.error);
	 * @example
	 * // Remove all commands
	 * guild.commands.set([])
	 *   .then(console.log)
	 *   .catch(console.error);
	 */
	async set(commands: unknown[], guildId?: Snowflake) {
		const data = (await this.client.rest.put(this.commandPath({ guildId }), {
			// @ts-expect-error
			body: commands.map((command) => (this.constructor as typeof ApplicationCommandManager).transformCommand(command)),
		})) as APIApplicationCommand[];
		return data.reduce(
			(collection: Collection<Snowflake, ApplicationCommand>, command: APIApplicationCommand) =>
				collection.set(command.id, this._add(command, true, guildId)),
			new Collection<Snowflake, ApplicationCommand>(),
		);
	}

	/**
	 * Edits an application command.
	 *
	 * @param {ApplicationCommandResolvable} command The command to edit
	 * @param {Partial<ApplicationCommandDataResolvable>} data The data to update the command with
	 * @param {Snowflake} [guildId] The guild's id where the command registered,
	 * ignored when using a {@link GuildApplicationCommandManager}
	 * @returns {Promise<ApplicationCommand>}
	 * @example
	 * // Edit an existing command
	 * client.application.commands.edit('123456789012345678', {
	 *   description: 'New description',
	 * })
	 *   .then(console.log)
	 *   .catch(console.error);
	 */
	async edit(
		command: ApplicationCommand | Snowflake | string,
		data: RESTPatchAPIApplicationCommandJSONBody | Record<string, unknown>,
		guildId?: Snowflake,
	) {
		const id = this.resolveId(command);
		if (!id) throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'command', 'ApplicationCommandResolvable');

		const patched = await this.client.rest.patch(this.commandPath({ id, guildId }), {
			body: (this.constructor as typeof ApplicationCommandManager).transformCommand(data),
		});
		return this._add(patched, true, guildId);
	}

	/**
	 * Deletes an application command.
	 *
	 * @param {ApplicationCommandResolvable} command The command to delete
	 * @param {Snowflake} [guildId] The guild's id where the command is registered,
	 * ignored when using a {@link GuildApplicationCommandManager}
	 * @returns {Promise<?ApplicationCommand>}
	 * @example
	 * // Delete a command
	 * guild.commands.delete('123456789012345678')
	 *   .then(console.log)
	 *   .catch(console.error);
	 */
	async delete(command: unknown, guildId?: Snowflake) {
		const id = this.resolveId(command as ApplicationCommand);
		if (!id) throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'command', 'ApplicationCommandResolvable');

		await this.client.rest.delete(this.commandPath({ id, guildId }));

		const cached = this.cache.get(id);
		this.cache.delete(id);
		return cached ?? null;
	}

	/**
	 * Transforms an {@link ApplicationCommandData} object into something that can be used with the API.
	 *
	 * @param {ApplicationCommandDataResolvable} command The command to transform
	 * @returns {APIApplicationCommand}
	 * @private
	 */
	// biome-ignore lint/suspicious/noExplicitAny: internal lifecycle method accepts heterogeneous payloads (API data, existing structure, or partial patch)
	static transformCommand(command: any) {
		if (isJSONEncodable(command)) return command.toJSON();

		let default_member_permissions: string | null | undefined;

		if ('default_member_permissions' in command) {
			default_member_permissions = command.default_member_permissions
				? new PermissionsBitField(BigInt(command.default_member_permissions)).bitfield.toString()
				: command.default_member_permissions;
		}

		if ('defaultMemberPermissions' in command) {
			default_member_permissions =
				command.defaultMemberPermissions === null
					? command.defaultMemberPermissions
					: new PermissionsBitField(command.defaultMemberPermissions).bitfield.toString();
		}

		return {
			name: command.name,
			name_localizations: command.nameLocalizations ?? command.name_localizations,
			description: command.description,
			nsfw: command.nsfw,
			description_localizations: command.descriptionLocalizations ?? command.description_localizations,
			type: command.type,
			// @ts-expect-error
			options: command.options?.map((option) => ApplicationCommand.transformOption(option)),
			default_member_permissions,
			integration_types: command.integrationTypes ?? command.integration_types,
			contexts: command.contexts,
			handler: command.handler,
		};
	}
}
