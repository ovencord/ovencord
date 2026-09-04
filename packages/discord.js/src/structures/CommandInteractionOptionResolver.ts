import type { APIChannel, APIGuildMember, APIRole, ChannelType } from 'discord-api-types/v10';
import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import type { Client } from '../client/Client.js';
import { DiscordjsTypeError, ErrorCodes } from '../errors/index.js';
import type { Attachment } from './Attachment.js';
import type { BaseChannel } from './BaseChannel.js';
import type { CommandInteractionOption, CommandInteractionResolvedData } from './CommandInteraction.js';
import type { GuildChannel } from './GuildChannel.js';
import type { GuildMember } from './GuildMember.js';
import type { Message } from './Message.js';
import type { Role } from './Role.js';
import type { ThreadChannel } from './ThreadChannel.js';
import type { User } from './User.js';

export interface AutocompleteFocusedOption {
	name: string;
	type: ApplicationCommandOptionType;
	value: string | number;
	focused: boolean;
}

/**
 * A resolver for command interaction options.
 */
export class CommandInteractionOptionResolver {
	public client!: Client;
	public _group: string | null;
	public _subcommand: string | null;
	public _hoistedOptions: CommandInteractionOption[];
	public readonly data!: readonly CommandInteractionOption[];
	public readonly resolved!: Readonly<CommandInteractionResolvedData> | null;

	constructor(client: Client, options: CommandInteractionOption[], resolved?: CommandInteractionResolvedData | null) {
		/**
		 * The client that instantiated this.
		 *
		 * @name CommandInteractionOptionResolver#client
		 * @type {Client}
		 * @readonly
		 */
		Object.defineProperty(this, 'client', { value: client });

		/**
		 * The name of the subcommand group.
		 *
		 * @type {?string}
		 * @private
		 */
		this._group = null;

		/**
		 * The name of the subcommand.
		 *
		 * @type {?string}
		 * @private
		 */
		this._subcommand = null;

		/**
		 * The bottom-level options for the interaction.
		 * If there is a subcommand (or subcommand and group), this is the options for the subcommand.
		 *
		 * @type {CommandInteractionOption[]}
		 * @private
		 */
		this._hoistedOptions = options ?? [];

		// Hoist subcommand group if present
		if (this._hoistedOptions[0]?.type === ApplicationCommandOptionType.SubcommandGroup) {
			this._group = this._hoistedOptions[0].name;
			this._hoistedOptions = this._hoistedOptions[0].options ?? [];
		}

		// Hoist subcommand if present
		if (this._hoistedOptions[0]?.type === ApplicationCommandOptionType.Subcommand) {
			this._subcommand = this._hoistedOptions[0].name;
			this._hoistedOptions = this._hoistedOptions[0].options ?? [];
		}

		/**
		 * The interaction options array.
		 *
		 * @name CommandInteractionOptionResolver#data
		 * @type {ReadonlyArray<CommandInteractionOption>}
		 * @readonly
		 */
		Object.defineProperty(this, 'data', { value: Object.freeze([...(options ?? [])]) });

		/**
		 * The interaction resolved data
		 *
		 * @name CommandInteractionOptionResolver#resolved
		 * @type {?Readonly<CommandInteractionResolvedData>}
		 */
		Object.defineProperty(this, 'resolved', { value: resolved ? Object.freeze(resolved) : null });
	}

	/**
	 * Gets an option by its name.
	 *
	 * @param {string} name The name of the option.
	 * @param {boolean} [required=false] Whether to throw an error if the option is not found.
	 * @returns {?CommandInteractionOption} The option, if found.
	 */
	get(name: string, required = false): CommandInteractionOption | null {
		const option = this._hoistedOptions.find((opt) => opt.name === name);
		if (!option) {
			if (required) {
				throw new DiscordjsTypeError(ErrorCodes.CommandInteractionOptionNotFound, name);
			}

			return null;
		}

		return option;
	}

	/**
	 * Gets an option by name and property and checks its type.
	 *
	 * @param {string} name The name of the option.
	 * @param {ApplicationCommandOptionType[]} allowedTypes The allowed types of the option.
	 * @param {string[]} properties The properties to check for for `required`.
	 * @param {boolean} required Whether to throw an error if the option is not found.
	 * @returns {?CommandInteractionOption} The option, if found.
	 * @private
	 */
	_getTypedOption(
		name: string,
		allowedTypes: (ApplicationCommandOptionType | string)[],
		properties: (keyof CommandInteractionOption)[],
		required: boolean,
	): CommandInteractionOption | null {
		const option = this.get(name, required);
		if (!option) {
			return null;
		} else if (!allowedTypes.includes(option.type as unknown as ApplicationCommandOptionType)) {
			throw new DiscordjsTypeError(ErrorCodes.CommandInteractionOptionType, name, option.type, allowedTypes.join(', '));
		} else if (required && properties.every((prop) => option[prop] === null || option[prop] === undefined)) {
			throw new DiscordjsTypeError(ErrorCodes.CommandInteractionOptionEmpty, name, option.type);
		}

		return option;
	}

	/**
	 * Gets the selected subcommand.
	 *
	 * @param {boolean} [required=true] Whether to throw an error if there is no subcommand.
	 * @returns {?string} The name of the selected subcommand, or null if not set and not required.
	 */
	getSubcommand(required = true): string | null {
		if (required && !this._subcommand) {
			throw new DiscordjsTypeError(ErrorCodes.CommandInteractionOptionNoSubcommand);
		}

		return this._subcommand;
	}

	/**
	 * Gets the selected subcommand group.
	 *
	 * @param {boolean} [required=false] Whether to throw an error if there is no subcommand group.
	 * @returns {?string} The name of the selected subcommand group, or null if not set and not required.
	 */
	getSubcommandGroup(required = false): string | null {
		if (required && !this._group) {
			throw new DiscordjsTypeError(ErrorCodes.CommandInteractionOptionNoSubcommandGroup);
		}

		return this._group;
	}

	/**
	 * Gets a boolean option.
	 *
	 * @param {string} name The name of the option.
	 * @param {boolean} [required=false] Whether to throw an error if the option is not found.
	 * @returns {?boolean} The value of the option, or null if not set and not required.
	 */
	getBoolean(name: string, required = false): boolean | null {
		const option = this._getTypedOption(name, [ApplicationCommandOptionType.Boolean], ['value'], required);
		return (option?.value as boolean) ?? null;
	}

	/**
	 * Gets a channel option.
	 *
	 * @param {string} name The name of the option.
	 * @param {boolean} [required=false] Whether to throw an error if the option is not found.
	 * @param {ChannelType[]} [channelTypes=[]] The allowed types of channels. If empty, all channel types are allowed.
	 * @returns {?(GuildChannel|ThreadChannel|APIChannel|BaseChannel)}
	 * The value of the option, or null if not set and not required.
	 */
	getChannel(
		name: string,
		required = false,
		channelTypes: ChannelType[] = [],
	): GuildChannel | ThreadChannel | APIChannel | BaseChannel | null {
		const option = this._getTypedOption(name, [ApplicationCommandOptionType.Channel], ['channel'], required);
		const channel = (option?.channel as GuildChannel | ThreadChannel | APIChannel | BaseChannel) ?? null;

		if (channel && channelTypes.length > 0 && !channelTypes.includes(channel.type as ChannelType)) {
			throw new DiscordjsTypeError(
				ErrorCodes.CommandInteractionOptionInvalidChannelType,
				name,
				channel.type,
				channelTypes.join(', '),
			);
		}

		return channel;
	}

	/**
	 * Gets a string option.
	 *
	 * @param {string} name The name of the option.
	 * @param {boolean} [required=false] Whether to throw an error if the option is not found.
	 * @returns {?string} The value of the option, or null if not set and not required.
	 */
	getString(name: string, required = false): string | null {
		const option = this._getTypedOption(name, [ApplicationCommandOptionType.String], ['value'], required);
		return (option?.value as string) ?? null;
	}

	/**
	 * Gets an integer option.
	 *
	 * @param {string} name The name of the option.
	 * @param {boolean} [required=false] Whether to throw an error if the option is not found.
	 * @returns {?number} The value of the option, or null if not set and not required.
	 */
	getInteger(name: string, required = false): number | null {
		const option = this._getTypedOption(name, [ApplicationCommandOptionType.Integer], ['value'], required);
		return (option?.value as number) ?? null;
	}

	/**
	 * Gets a number option.
	 *
	 * @param {string} name The name of the option.
	 * @param {boolean} [required=false] Whether to throw an error if the option is not found.
	 * @returns {?number} The value of the option, or null if not set and not required.
	 */
	getNumber(name: string, required = false): number | null {
		const option = this._getTypedOption(name, [ApplicationCommandOptionType.Number], ['value'], required);
		return (option?.value as number) ?? null;
	}

	/**
	 * Gets a user option.
	 *
	 * @param {string} name The name of the option.
	 * @param {boolean} [required=false] Whether to throw an error if the option is not found.
	 * @returns {?User} The value of the option, or null if not set and not required.
	 */
	getUser(name: string, required = false): User | null {
		const option = this._getTypedOption(
			name,
			[ApplicationCommandOptionType.User, ApplicationCommandOptionType.Mentionable],
			['user'],
			required,
		);
		return option?.user ?? null;
	}

	/**
	 * Gets a member option.
	 *
	 * @param {string} name The name of the option.
	 * @returns {?(GuildMember|APIGuildMember)}
	 * The value of the option, or null if the user is not present in the guild or the option is not set.
	 */
	getMember(name: string): GuildMember | APIGuildMember | null {
		const option = this._getTypedOption(
			name,
			[ApplicationCommandOptionType.User, ApplicationCommandOptionType.Mentionable],
			['member'],
			false,
		);
		return option?.member ?? null;
	}

	/**
	 * Gets a role option.
	 *
	 * @param {string} name The name of the option.
	 * @param {boolean} [required=false] Whether to throw an error if the option is not found.
	 * @returns {?(Role|APIRole)} The value of the option, or null if not set and not required.
	 */
	getRole(name: string, required = false): Role | APIRole | null {
		const option = this._getTypedOption(
			name,
			[ApplicationCommandOptionType.Role, ApplicationCommandOptionType.Mentionable],
			['role'],
			required,
		);
		return option?.role ?? null;
	}

	/**
	 * Gets an attachment option.
	 *
	 * @param {string} name The name of the option.
	 * @param {boolean} [required=false] Whether to throw an error if the option is not found.
	 * @returns {?Attachment} The value of the option, or null if not set and not required.
	 */
	getAttachment(name: string, required = false): Attachment | null {
		const option = this._getTypedOption(name, [ApplicationCommandOptionType.Attachment], ['attachment'], required);
		return option?.attachment ?? null;
	}

	/**
	 * Gets a mentionable option.
	 *
	 * @param {string} name The name of the option.
	 * @param {boolean} [required=false] Whether to throw an error if the option is not found.
	 * @returns {?(User|GuildMember|APIGuildMember|Role|APIRole)}
	 * The value of the option, or null if not set and not required.
	 */
	getMentionable(name: string, required = false): User | GuildMember | APIGuildMember | Role | APIRole | null {
		const option = this._getTypedOption(
			name,
			[ApplicationCommandOptionType.Mentionable],
			['user', 'member', 'role'],
			required,
		);
		return option?.member ?? option?.user ?? option?.role ?? null;
	}

	/**
	 * Gets a message option.
	 *
	 * @param {string} name The name of the option.
	 * @param {boolean} [required=false] Whether to throw an error if the option is not found.
	 * @returns {?Message}
	 * The value of the option, or null if not set and not required.
	 */
	getMessage(name: string, required = false): Message | null {
		const option = this._getTypedOption(name, ['_MESSAGE'], ['message' as keyof CommandInteractionOption], required);
		return (option as { message?: Message })?.message ?? null;
	}

	/**
	 * Gets the focused option.
	 *
	 * @param {boolean} [getFull=false] Whether to get the full option object
	 * @returns {AutocompleteFocusedOption | string | number}
	 * The option that is focused or its value
	 */
	getFocused(getFull?: false): string | number;
	getFocused(getFull: true): AutocompleteFocusedOption;
	getFocused(getFull = false): AutocompleteFocusedOption | string | number {
		const focusedOption = this._hoistedOptions.find((option) => (option as AutocompleteFocusedOption).focused) as
			| AutocompleteFocusedOption
			| undefined;
		if (!focusedOption) throw new DiscordjsTypeError(ErrorCodes.AutocompleteInteractionOptionNoFocusedOption);
		return getFull ? focusedOption : focusedOption.value;
	}
}
