import { DiscordSnowflake } from '@ovencord/util';
import {
	type APIApplicationCommand,
	type APIApplicationCommandOption,
	type APIApplicationCommandOptionChoice,
	ApplicationCommandOptionType,
	type ApplicationCommandType,
	type ApplicationIntegrationType,
	type EntryPointCommandHandlerType,
	type InteractionContextType,
	type Snowflake,
} from 'discord-api-types/v10';

import type { Client } from '../client/Client.js';
import { ApplicationCommandPermissionsManager } from '../managers/ApplicationCommandPermissionsManager.js';
import { PermissionsBitField } from '../util/PermissionsBitField.js';
import { Base } from './Base.js';
import type { Guild } from './Guild.js';

export type LocalizationMap = Record<string, string>;

export interface ApplicationCommandOptionChoiceData {
	name: string;
	nameLocalizations?: LocalizationMap;
	value: string | number;
}

export interface ApplicationCommandOptionData {
	type: ApplicationCommandOptionType;
	name: string;
	nameLocalizations?: LocalizationMap;
	description: string;
	descriptionLocalizations?: LocalizationMap;
	autocomplete?: boolean;
	required?: boolean;
	choices?: ApplicationCommandOptionChoiceData[];
	options?: ApplicationCommandOptionData[];
	channelTypes?: number[];
	minValue?: number;
	maxValue?: number;
	minLength?: number;
	maxLength?: number;
}

export interface ApplicationCommandData {
	name: string;
	nameLocalizations?: LocalizationMap;
	description: string;
	nsfw?: boolean;
	descriptionLocalizations?: LocalizationMap;
	type?: ApplicationCommandType;
	options?: ApplicationCommandOptionData[];
	defaultMemberPermissions?: bigint | number | string | null;
	integrationTypes?: ApplicationIntegrationType[];
	contexts?: InteractionContextType[];
	handler?: EntryPointCommandHandlerType;
}

export interface ApplicationCommandOptionChoice {
	name: string;
	nameLocalized?: string | null;
	nameLocalizations?: LocalizationMap;
	value: string | number;
}

export interface ApplicationCommandOption {
	type: ApplicationCommandOptionType;
	name: string;
	nameLocalizations?: LocalizationMap;
	nameLocalized?: string | null;
	description: string;
	descriptionLocalizations?: LocalizationMap;
	descriptionLocalized?: string | null;
	required?: boolean;
	autocomplete?: boolean;
	choices?: ApplicationCommandOptionChoice[];
	options?: ApplicationCommandOption[];
	channelTypes?: number[];
	minValue?: number;
	maxValue?: number;
	minLength?: number;
	maxLength?: number;
}

/**
 * Represents an application command.
 *
 * @extends {Base}
 */
export class ApplicationCommand extends Base {
	public id: Snowflake;
	public applicationId: Snowflake;
	public guild: Guild | null;
	public guildId: Snowflake | null;
	public permissions: ApplicationCommandPermissionsManager;
	public type: ApplicationCommandType;
	public nsfw: boolean;
	public name: string;
	public nameLocalizations: LocalizationMap | null;
	public nameLocalized: string | null;
	public description: string;
	public descriptionLocalizations: LocalizationMap | null;
	public descriptionLocalized: string | null;
	public options: ApplicationCommandOption[] | null;
	public defaultMemberPermissions: Readonly<PermissionsBitField> | null;
	public integrationTypes: ApplicationIntegrationType[] | null;
	public contexts: InteractionContextType[] | null;
	public handler: EntryPointCommandHandlerType | null;
	public version: Snowflake;
	constructor(
		client: Client,
		data: Partial<APIApplicationCommand> & Record<string, unknown>,
		guild: Guild | null,
		guildId: Snowflake | null,
	) {
		super(client);

		/**
		 * The command's id
		 *
		 * @type {Snowflake}
		 */
		this.id = data.id;

		/**
		 * The parent application's id
		 *
		 * @type {Snowflake}
		 */
		this.applicationId = data.application_id;

		/**
		 * The guild this command is part of
		 *
		 * @type {?Guild}
		 */
		this.guild = guild ?? null;

		/**
		 * The guild's id this command is part of, this may be non-null when `guild` is `null` if the command
		 * was fetched from the `ApplicationCommandManager`
		 *
		 * @type {?Snowflake}
		 */
		this.guildId = guild?.id ?? guildId ?? null;

		/**
		 * The manager for permissions of this command on its guild or arbitrary guilds when the command is global
		 *
		 * @type {ApplicationCommandPermissionsManager}
		 */
		this.permissions = new ApplicationCommandPermissionsManager(this);

		/**
		 * The type of this application command
		 *
		 * @type {ApplicationCommandType}
		 */
		this.type = data.type;

		/**
		 * Whether this command is age-restricted (18+)
		 *
		 * @type {boolean}
		 */
		this.nsfw = data.nsfw ?? false;

		this._patch(data);
	}

	_patch(data: Partial<ApplicationCommandData> & Partial<APIApplicationCommand> & Record<string, unknown>) {
		if ('name' in data) {
			/**
			 * The name of this command
			 *
			 * @type {string}
			 */
			this.name = data.name;
		}

		if ('name_localizations' in data) {
			/**
			 * The name localizations for this command
			 *
			 * @type {?LocalizationMap}
			 */
			this.nameLocalizations = data.name_localizations;
		} else {
			this.nameLocalizations ??= null;
		}

		if ('name_localized' in data) {
			/**
			 * The localized name for this command
			 *
			 * @type {?string}
			 */
			this.nameLocalized = data.name_localized;
		} else {
			this.nameLocalized ??= null;
		}

		if ('description' in data) {
			/**
			 * The description of this command
			 *
			 * @type {string}
			 */
			this.description = data.description;
		}

		if ('description_localizations' in data) {
			/**
			 * The description localizations for this command
			 *
			 * @type {?LocalizationMap}
			 */
			this.descriptionLocalizations = data.description_localizations;
		} else {
			this.descriptionLocalizations ??= null;
		}

		if ('description_localized' in data) {
			/**
			 * The localized description for this command
			 *
			 * @type {?string}
			 */
			this.descriptionLocalized = data.description_localized;
		} else {
			this.descriptionLocalized ??= null;
		}

		if ('options' in data) {
			/**
			 * The options of this command
			 *
			 * @type {?ApplicationCommandOption[]}
			 */
			this.options = data.options.map(
				(option: APIApplicationCommandOption) =>
					(this.constructor as typeof ApplicationCommand).transformOption(option, true) as ApplicationCommandOption,
			);
		} else {
			this.options ??= null;
		}

		if ('default_member_permissions' in data) {
			/**
			 * The default bitfield used to determine whether this command be used in a guild
			 *
			 * @type {?Readonly<PermissionsBitField>}
			 */
			this.defaultMemberPermissions = data.default_member_permissions
				? new PermissionsBitField(BigInt(data.default_member_permissions)).freeze()
				: null;
		} else {
			this.defaultMemberPermissions ??= null;
		}

		if ('integration_types' in data) {
			/**
			 * Installation context(s) where the command is available
			 * <info>Only for globally-scoped commands</info>
			 *
			 * @type {?ApplicationIntegrationType[]}
			 */
			this.integrationTypes = data.integration_types;
		} else {
			this.integrationTypes ??= null;
		}

		if ('contexts' in data) {
			/**
			 * Interaction context(s) where the command can be used
			 * <info>Only for globally-scoped commands</info>
			 *
			 * @type {?InteractionContextType[]}
			 */
			this.contexts = data.contexts;
		} else {
			this.contexts ??= null;
		}

		if ('handler' in data) {
			/**
			 * Determines whether the interaction is handled by the app's interactions handler or by Discord.
			 * <info>Only available for {@link ApplicationCommandType.PrimaryEntryPoint} commands on
			 * applications with the {@link ApplicationFlags.Embedded} flag (i.e, those that have an Activity)</info>
			 *
			 * @type {?EntryPointCommandHandlerType}
			 */
			this.handler = data.handler;
		} else {
			this.handler ??= null;
		}

		if ('version' in data) {
			/**
			 * Autoincrementing version identifier updated during substantial record changes
			 *
			 * @type {Snowflake}
			 */
			this.version = data.version;
		}
	}

	/**
	 * The timestamp the command was created at
	 *
	 * @type {number}
	 * @readonly
	 */
	get createdTimestamp() {
		return DiscordSnowflake.timestampFrom(this.id);
	}

	/**
	 * The time the command was created at
	 *
	 * @type {Date}
	 * @readonly
	 */
	get createdAt() {
		return new Date(this.createdTimestamp);
	}

	/**
	 * The manager that this command belongs to
	 *
	 * @type {ApplicationCommandManager}
	 * @readonly
	 */
	get manager() {
		return (this.guild ?? this.client.application).commands;
	}

	/**
	 * Data for creating or editing an application command.
	 *
	 * @typedef {Object} ApplicationCommandData
	 * @property {string} name The name of the command, must be in all lowercase if type is
	 * {@link ApplicationCommandType.ChatInput}
	 * @property {LocalizationMap} [nameLocalizations] The localizations for the command name
	 * @property {string} description The description of the command,
	 * if type is {@link ApplicationCommandType.ChatInput} or {@link ApplicationCommandType.PrimaryEntryPoint}
	 * @property {boolean} [nsfw] Whether the command is age-restricted
	 * @property {LocalizationMap} [descriptionLocalizations] The localizations for the command description,
	 * if type is {@link ApplicationCommandType.ChatInput} or {@link ApplicationCommandType.PrimaryEntryPoint}
	 * @property {ApplicationCommandType} [type=ApplicationCommandType.ChatInput] The type of the command
	 * @property {ApplicationCommandOptionData[]} [options] Options for the command
	 * @property {?PermissionResolvable} [defaultMemberPermissions] The bitfield used to determine the default permissions
	 * a member needs in order to run the command
	 * @property {ApplicationIntegrationType[]} [integrationTypes] Installation contexts where the command is available
	 * @property {InteractionContextType[]} [contexts] Interaction contexts where the command can be used
	 * @property {EntryPointCommandHandlerType} [handler] Whether the interaction is handled by the app's
	 * interactions handler or by Discord.
	 */

	/**
	 * An option for an application command or subcommand.
	 * <info>In addition to the listed properties, when used as a parameter,
	 * API style `snake_case` properties can be used for compatibility with generators like `@ovencord/builders`.</info>
	 * <warn>Note that providing a value for the `camelCase` counterpart for any `snake_case` property
	 * will discard the provided `snake_case` property.</warn>
	 *
	 * @typedef {Object} ApplicationCommandOptionData
	 * @property {ApplicationCommandOptionType} type The type of the option
	 * @property {string} name The name of the option
	 * @property {LocalizationMap} [nameLocalizations] The name localizations for the option
	 * @property {string} description The description of the option
	 * @property {LocalizationMap} [descriptionLocalizations] The description localizations for the option
	 * @property {boolean} [autocomplete] Whether the autocomplete interaction is enabled for a
	 * {@link ApplicationCommandOptionType.String}, {@link ApplicationCommandOptionType.Integer} or
	 * {@link ApplicationCommandOptionType.Number} option
	 * @property {boolean} [required] Whether the option is required
	 * @property {ApplicationCommandOptionChoiceData[]} [choices] The choices of the option for the user to pick from
	 * @property {ApplicationCommandOptionData[]} [options] Additional options if this option is a subcommand (group)
	 * @property {ChannelType[]} [channelTypes] When the option type is channel,
	 * the allowed types of channels that can be selected
	 * @property {number} [minValue] The minimum value for an {@link ApplicationCommandOptionType.Integer} or
	 * {@link ApplicationCommandOptionType.Number} option
	 * @property {number} [maxValue] The maximum value for an {@link ApplicationCommandOptionType.Integer} or
	 * {@link ApplicationCommandOptionType.Number} option
	 * @property {number} [minLength] The minimum length for an {@link ApplicationCommandOptionType.String} option
	 * (maximum of `6000`)
	 * @property {number} [maxLength] The maximum length for an {@link ApplicationCommandOptionType.String} option
	 * (maximum of `6000`)
	 */

	/**
	 * @typedef {Object} ApplicationCommandOptionChoiceData
	 * @property {string} name The name of the choice
	 * @property {LocalizationMap} [nameLocalizations] The localized names for this choice
	 * @property {string|number} value The value of the choice
	 */

	/**
	 * Edits this application command.
	 *
	 * @param {Partial<ApplicationCommandData>} data The data to update the command with
	 * @returns {Promise<ApplicationCommand>}
	 * @example
	 * // Edit the description of this command
	 * command.edit({
	 *   description: 'New description',
	 * })
	 *   .then(console.log)
	 *   .catch(console.error);
	 */
	async edit(data: Partial<ApplicationCommandData> & Record<string, unknown>) {
		return this.manager.edit(this, data, this.guildId);
	}

	/**
	 * Edits the name of this ApplicationCommand
	 *
	 * @param {string} name The new name of the command
	 * @returns {Promise<ApplicationCommand>}
	 */
	async setName(name: string) {
		return this.edit({ name });
	}

	/**
	 * Edits the localized names of this ApplicationCommand
	 *
	 * @param {LocalizationMap} nameLocalizations The new localized names for the command
	 * @returns {Promise<ApplicationCommand>}
	 * @example
	 * // Edit the name localizations of this command
	 * command.setNameLocalizations({
	 *   'en-GB': 'test',
	 *   'pt-BR': 'teste',
	 * })
	 *   .then(console.log)
	 *   .catch(console.error)
	 */
	async setNameLocalizations(nameLocalizations: LocalizationMap) {
		return this.edit({ nameLocalizations });
	}

	/**
	 * Edits the description of this ApplicationCommand
	 *
	 * @param {string} description The new description of the command
	 * @returns {Promise<ApplicationCommand>}
	 */
	async setDescription(description: string) {
		return this.edit({ description });
	}

	/**
	 * Edits the localized descriptions of this ApplicationCommand
	 *
	 * @param {LocalizationMap} descriptionLocalizations The new localized descriptions for the command
	 * @returns {Promise<ApplicationCommand>}
	 * @example
	 * // Edit the description localizations of this command
	 * command.setDescriptionLocalizations({
	 *   'en-GB': 'A test command',
	 *   'pt-BR': 'Um comando de teste',
	 * })
	 *   .then(console.log)
	 *   .catch(console.error)
	 */
	async setDescriptionLocalizations(descriptionLocalizations: LocalizationMap) {
		return this.edit({ descriptionLocalizations });
	}

	/**
	 * Edits the default member permissions of this ApplicationCommand
	 *
	 * @param {?PermissionResolvable} defaultMemberPermissions The default member permissions required to run this command
	 * @returns {Promise<ApplicationCommand>}
	 */
	async setDefaultMemberPermissions(defaultMemberPermissions: bigint | number | string | null) {
		return this.edit({ defaultMemberPermissions });
	}

	/**
	 * Edits the options of this ApplicationCommand
	 *
	 * @param {ApplicationCommandOptionData[]} options The options to set for this command
	 * @returns {Promise<ApplicationCommand>}
	 */
	async setOptions(options: ApplicationCommandOptionData[]) {
		return this.edit({ options });
	}

	/**
	 * Deletes this command.
	 *
	 * @returns {Promise<ApplicationCommand>}
	 * @example
	 * // Delete this command
	 * command.delete()
	 *   .then(console.log)
	 *   .catch(console.error);
	 */
	async delete() {
		return this.manager.delete(this, this.guildId);
	}

	/**
	 * Whether this command equals another command. It compares all properties, so for most operations
	 * it is advisable to just compare `command.id === command2.id` as it is much faster and is often
	 * what most users need.
	 *
	 * @param {ApplicationCommand|ApplicationCommandData|APIApplicationCommand} command The command to compare with
	 * @param {boolean} [enforceOptionOrder=false] Whether to strictly check that options and choices are in the same
	 * order in the array <info>The client may not always respect this ordering!</info>
	 * @returns {boolean}
	 */
	equals(
		command: Partial<ApplicationCommand> &
			Partial<ApplicationCommandData> &
			Partial<APIApplicationCommand> &
			Record<string, unknown>,
		enforceOptionOrder = false,
	) {
		// If given an id, check if the id matches
		if ('id' in command && command.id && this.id !== command.id) return false;

		let defaultMemberPermissions = null;

		if ('default_member_permissions' in command) {
			defaultMemberPermissions = command.default_member_permissions
				? new PermissionsBitField(BigInt(command.default_member_permissions as string | number)).bitfield
				: null;
		}

		if ('defaultMemberPermissions' in command) {
			defaultMemberPermissions =
				command.defaultMemberPermissions === null
					? null
					: new PermissionsBitField(
							command.defaultMemberPermissions as Parameters<typeof PermissionsBitField.resolve>[0],
						).bitfield;
		}

		// Check top level parameters
		if (
			command.name !== this.name ||
			('description' in command && command.description !== this.description) ||
			('version' in command && command.version !== this.version) ||
			(command.type && command.type !== this.type) ||
			('nsfw' in command && command.nsfw !== this.nsfw) ||
			command.options?.length !== this.options?.length ||
			defaultMemberPermissions !== (this.defaultMemberPermissions?.bitfield ?? null) ||
			!Bun.deepEquals(command.nameLocalizations ?? command.name_localizations ?? {}, this.nameLocalizations ?? {}) ||
			!Bun.deepEquals(
				command.descriptionLocalizations ?? command.description_localizations ?? {},
				this.descriptionLocalizations ?? {},
			) ||
			!Bun.deepEquals(command.integrationTypes ?? command.integration_types ?? [], this.integrationTypes ?? []) ||
			!Bun.deepEquals(command.contexts ?? [], this.contexts ?? []) ||
			('handler' in command && command.handler !== this.handler)
		) {
			return false;
		}

		// Don't need to check both because we already checked the lengths above
		if (command.options) {
			return (this.constructor as typeof ApplicationCommand).optionsEqual(
				this.options,
				command.options,
				enforceOptionOrder,
			);
		}

		return true;
	}

	/**
	 * Recursively checks that all options for an {@link ApplicationCommand} are equal to the provided options.
	 * In most cases it is better to compare using {@link ApplicationCommand#equals}
	 *
	 * @param {ApplicationCommandOptionData[]} existing The options on the existing command,
	 * should be {@link ApplicationCommand#options}
	 * @param {ApplicationCommandOptionData[]|APIApplicationCommandOption[]} options The options to compare against
	 * @param {boolean} [enforceOptionOrder=false] Whether to strictly check that options and choices are in the same
	 * order in the array <info>The client may not always respect this ordering!</info>
	 * @returns {boolean}
	 */
	static optionsEqual(
		existing: ApplicationCommandOption[],
		options: ApplicationCommandOptionData[] | APIApplicationCommandOption[],
		enforceOptionOrder = false,
	): boolean {
		if (existing.length !== options.length) return false;
		if (enforceOptionOrder) {
			return existing.every((option: ApplicationCommandOption, index: number) =>
				ApplicationCommand._optionEquals(
					option,
					options[index] as ApplicationCommandOptionData | APIApplicationCommandOption,
					enforceOptionOrder,
				),
			);
		}

		const newOptions = new Map(options.map((option) => [option.name, option]));
		for (const option of existing) {
			const foundOption = newOptions.get(option.name);
			if (
				!foundOption ||
				!ApplicationCommand._optionEquals(
					option,
					foundOption as ApplicationCommandOptionData | APIApplicationCommandOption,
				)
			)
				return false;
		}

		return true;
	}

	/**
	 * Checks that an option for an {@link ApplicationCommand} is equal to the provided option
	 * In most cases it is better to compare using {@link ApplicationCommand#equals}
	 *
	 * @param {ApplicationCommandOptionData} existing The option on the existing command,
	 * should be from {@link ApplicationCommand#options}
	 * @param {ApplicationCommandOptionData|APIApplicationCommandOption} option The option to compare against
	 * @param {boolean} [enforceOptionOrder=false] Whether to strictly check that options or choices are in the same
	 * order in their array <info>The client may not always respect this ordering!</info>
	 * @returns {boolean}
	 * @private
	 */
	static _optionEquals(
		existing: ApplicationCommandOption,
		option: ApplicationCommandOptionData | APIApplicationCommandOption,
		enforceOptionOrder = false,
	): boolean {
		const opt = option as Partial<ApplicationCommandOptionData> &
			Partial<APIApplicationCommandOption> &
			Record<string, unknown>;
		if (
			opt.name !== existing.name ||
			opt.type !== existing.type ||
			opt.description !== existing.description ||
			opt.autocomplete !== existing.autocomplete ||
			(opt.required ??
				([ApplicationCommandOptionType.Subcommand, ApplicationCommandOptionType.SubcommandGroup].includes(
					opt.type as ApplicationCommandOptionType,
				)
					? undefined
					: false)) !== existing.required ||
			opt.choices?.length !== existing.choices?.length ||
			opt.options?.length !== existing.options?.length ||
			((opt.channelTypes ?? opt.channel_types) as number[])?.length !== existing.channelTypes?.length ||
			((opt.minValue ?? opt.min_value) as number) !== existing.minValue ||
			((opt.maxValue ?? opt.max_value) as number) !== existing.maxValue ||
			((opt.minLength ?? opt.min_length) as number) !== existing.minLength ||
			((opt.maxLength ?? opt.max_length) as number) !== existing.maxLength ||
			!Bun.deepEquals(opt.nameLocalizations ?? opt.name_localizations ?? {}, existing.nameLocalizations ?? {}) ||
			!Bun.deepEquals(
				opt.descriptionLocalizations ?? opt.description_localizations ?? {},
				existing.descriptionLocalizations ?? {},
			)
		) {
			return false;
		}

		if (existing.choices) {
			if (
				enforceOptionOrder &&
				!existing.choices.every(
					(choice: ApplicationCommandOptionChoice, index: number) =>
						choice.name === opt.choices?.[index]?.name &&
						choice.value === opt.choices?.[index]?.value &&
						Bun.deepEquals(
							choice.nameLocalizations ?? {},
							(opt.choices?.[index] as unknown as Record<string, unknown>)?.nameLocalizations ??
								(opt.choices?.[index] as unknown as Record<string, unknown>)?.name_localizations ??
								{},
						),
				)
			) {
				return false;
			}

			if (!enforceOptionOrder) {
				const newChoices = new Map<string, ApplicationCommandOptionChoiceData | APIApplicationCommandOptionChoice>(
					(opt.choices ?? []).map((choice: ApplicationCommandOptionChoiceData | APIApplicationCommandOptionChoice) => [
						choice.name,
						choice,
					]),
				);
				for (const choice of existing.choices) {
					const foundChoice = newChoices.get(choice.name);
					if (!foundChoice || foundChoice.value !== choice.value) return false;
				}
			}
		}

		if (existing.channelTypes) {
			const newTypes = (opt.channelTypes ?? opt.channel_types) as number[];
			for (const type of existing.channelTypes) {
				if (!newTypes.includes(type)) return false;
			}
		}

		if (existing.options) {
			return ApplicationCommand.optionsEqual(
				existing.options,
				opt.options as ApplicationCommandOptionData[] | APIApplicationCommandOption[],
				enforceOptionOrder,
			);
		}

		return true;
	}

	/**
	 * An option for an application command or subcommand.
	 *
	 * @typedef {Object} ApplicationCommandOption
	 * @property {ApplicationCommandOptionType} type The type of the option
	 * @property {string} name The name of the option
	 * @property {LocalizationMap} [nameLocalizations] The localizations for the option name
	 * @property {string} [nameLocalized] The localized name for this option
	 * @property {string} description The description of the option
	 * @property {LocalizationMap} [descriptionLocalizations] The localizations for the option description
	 * @property {string} [descriptionLocalized] The localized description for this option
	 * @property {boolean} [required] Whether the option is required
	 * @property {boolean} [autocomplete] Whether the autocomplete interaction is enabled for a
	 * {@link ApplicationCommandOptionType.String}, {@link ApplicationCommandOptionType.Integer} or
	 * {@link ApplicationCommandOptionType.Number} option
	 * @property {ApplicationCommandOptionChoice[]} [choices] The choices of the option for the user to pick from
	 * @property {ApplicationCommandOption[]} [options] Additional options if this option is a subcommand (group)
	 * @property {ApplicationCommandOptionAllowedChannelType[]} [channelTypes] When the option type is channel,
	 * the allowed types of channels that can be selected
	 * @property {number} [minValue] The minimum value for an {@link ApplicationCommandOptionType.Integer} or
	 * {@link ApplicationCommandOptionType.Number} option
	 * @property {number} [maxValue] The maximum value for an {@link ApplicationCommandOptionType.Integer} or
	 * {@link ApplicationCommandOptionType.Number} option
	 * @property {number} [minLength] The minimum length for an {@link ApplicationCommandOptionType.String} option
	 * (maximum of `6000`)
	 * @property {number} [maxLength] The maximum length for an {@link ApplicationCommandOptionType.String} option
	 * (maximum of `6000`)
	 */

	/**
	 * A choice for an application command option.
	 *
	 * @typedef {Object} ApplicationCommandOptionChoice
	 * @property {string} name The name of the choice
	 * @property {?string} nameLocalized The localized name of the choice in the provided locale, if any
	 * @property {?LocalizationMap} [nameLocalizations] The localized names for this choice
	 * @property {string|number} value The value of the choice
	 */

	/**
	 * Transforms an {@link ApplicationCommandOptionData} object into something that can be used with the API.
	 *
	 * @param {ApplicationCommandOptionData|ApplicationCommandOption} option The option to transform
	 * @param {boolean} [received] Whether this option has been received from Discord
	 * @returns {APIApplicationCommandOption}
	 * @private
	 */
	static transformOption(
		option: ApplicationCommandOptionData | APIApplicationCommandOption,
		received?: boolean,
	): APIApplicationCommandOption {
		const opt = option as Partial<ApplicationCommandOptionData> &
			Partial<APIApplicationCommandOption> &
			Record<string, unknown>;
		const channelTypesKey = received ? 'channelTypes' : 'channel_types';
		const minValueKey = received ? 'minValue' : 'min_value';
		const maxValueKey = received ? 'maxValue' : 'max_value';
		const minLengthKey = received ? 'minLength' : 'min_length';
		const maxLengthKey = received ? 'maxLength' : 'max_length';
		const nameLocalizationsKey = received ? 'nameLocalizations' : 'name_localizations';
		const nameLocalizedKey = received ? 'nameLocalized' : 'name_localized';
		const descriptionLocalizationsKey = received ? 'descriptionLocalizations' : 'description_localizations';
		const descriptionLocalizedKey = received ? 'descriptionLocalized' : 'description_localized';
		return {
			type: opt.type,
			name: opt.name,
			[nameLocalizationsKey]: opt.nameLocalizations ?? opt.name_localizations,
			[nameLocalizedKey]: opt.nameLocalized ?? opt.name_localized,
			description: opt.description,
			[descriptionLocalizationsKey]: opt.descriptionLocalizations ?? opt.description_localizations,
			[descriptionLocalizedKey]: opt.descriptionLocalized ?? opt.description_localized,
			required: (opt.required ??
				([ApplicationCommandOptionType.Subcommand, ApplicationCommandOptionType.SubcommandGroup].includes(
					opt.type as ApplicationCommandOptionType,
				)
					? undefined
					: false)) as boolean,
			autocomplete: opt.autocomplete as boolean,
			choices: opt.choices?.map((choice) => {
				const c = choice as unknown as Record<string, unknown>;
				return {
					name: c.name as string,
					[nameLocalizedKey]: c.nameLocalized ?? c.name_localized,
					[nameLocalizationsKey]: c.nameLocalizations ?? c.name_localizations,
					value: c.value as string | number,
				};
			}) as unknown as APIApplicationCommandOptionChoice[],
			options: opt.options?.map((o) =>
				ApplicationCommand.transformOption(o as ApplicationCommandOptionData | APIApplicationCommandOption, received),
			),
			[channelTypesKey]: opt.channelTypes ?? opt.channel_types,
			[minValueKey]: opt.minValue ?? opt.min_value,
			[maxValueKey]: opt.maxValue ?? opt.max_value,
			[minLengthKey]: opt.minLength ?? opt.min_length,
			[maxLengthKey]: opt.maxLength ?? opt.max_length,
		} as unknown as APIApplicationCommandOption;
	}
}

/**
 * @external ApplicationCommandOptionAllowedChannelType
 * @see {@link https://discord.js.org/docs/packages/builders/stable/ApplicationCommandOptionAllowedChannelType:TypeAlias}
 */
