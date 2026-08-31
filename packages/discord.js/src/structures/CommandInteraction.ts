import type { Collection } from '@ovencord/collection';
import type {
	APIApplicationCommandInteraction,
	APIApplicationCommandOption,
	APIInteractionDataResolved,
	ApplicationCommandOptionType,
	ApplicationCommandType,
	Snowflake,
} from 'discord-api-types/v10';
import type { Client } from '../client/Client.js';
import { Attachment } from './Attachment.js';
import type { BaseChannel } from './BaseChannel.js';
import { BaseInteraction } from './BaseInteraction.js';
import type { GuildMember } from './GuildMember.js';
import { InteractionWebhook } from './InteractionWebhook.js';
import { InteractionResponses } from './interfaces/InteractionResponses.js';
import type { Message } from './Message.js';
import type { Role } from './Role.js';
import type { User } from './User.js';

export interface CommandInteractionResolvedData {
	users?: Collection<Snowflake, User>;
	members?: Collection<Snowflake, GuildMember | any>;
	roles?: Collection<Snowflake, Role | any>;
	channels?: Collection<Snowflake, BaseChannel | any>;
	attachments?: Collection<Snowflake, Attachment>;
	messages?: Collection<Snowflake, Message | any>;
}

export interface CommandInteractionOption {
	name: string;
	type: ApplicationCommandOptionType;
	autocomplete?: boolean;
	value?: string | number | boolean;
	options?: CommandInteractionOption[];
	user?: User;
	member?: GuildMember | any;
	channel?: BaseChannel | any;
	role?: Role | any;
	attachment?: Attachment;
}

/**
 * Represents a command interaction.
 *
 * @extends {BaseInteraction}
 * @implements {InteractionResponses}
 * @abstract
 */
export class CommandInteraction extends BaseInteraction {
	public commandId: Snowflake;
	public commandName: string;
	public commandType: ApplicationCommandType;
	public commandGuildId: Snowflake | null;
	public deferred: boolean;
	public replied: boolean;
	public ephemeral: boolean | null;
	public webhook: InteractionWebhook;
	constructor(client: Client, data: APIApplicationCommandInteraction) {
		super(client, data);

		/**
		 * The id of the channel this interaction was sent in
		 *
		 * @type {Snowflake}
		 * @name CommandInteraction#channelId
		 */

		/**
		 * The invoked application command's id
		 *
		 * @type {Snowflake}
		 */
		this.commandId = data.data.id;

		/**
		 * The invoked application command's name
		 *
		 * @type {string}
		 */
		this.commandName = data.data.name;

		/**
		 * The invoked application command's type
		 *
		 * @type {ApplicationCommandType}
		 */
		this.commandType = data.data.type;

		/**
		 * The id of the guild the invoked application command is registered to
		 *
		 * @type {?Snowflake}
		 */
		this.commandGuildId = data.data.guild_id ?? null;

		/**
		 * Whether the reply to this interaction has been deferred
		 *
		 * @type {boolean}
		 */
		this.deferred = false;

		/**
		 * Whether this interaction has already been replied to
		 *
		 * @type {boolean}
		 */
		this.replied = false;

		/**
		 * Whether the reply to this interaction is ephemeral
		 *
		 * @type {?boolean}
		 */
		this.ephemeral = null;

		/**
		 * An associated interaction webhook, can be used to further interact with this interaction
		 *
		 * @type {InteractionWebhook}
		 */
		this.webhook = new InteractionWebhook(this.client, this.applicationId, this.token);
	}

	/**
	 * The invoked application command, if it was fetched before
	 *
	 * @type {?ApplicationCommand}
	 */
	get command() {
		const id = this.commandId;
		return this.guild?.commands.cache.get(id) ?? this.client.application.commands.cache.get(id) ?? null;
	}

	/**
	 * @typedef {Object} BaseInteractionResolvedData
	 * @property {Collection<Snowflake, User>} [users] The resolved users
	 * @property {Collection<Snowflake, GuildMember|APIGuildMember>} [members] The resolved guild members
	 * @property {Collection<Snowflake, Role|APIRole>} [roles] The resolved roles
	 * @property {Collection<Snowflake, BaseChannel|APIChannel>} [channels] The resolved channels
	 * @property {Collection<Snowflake, Attachment>} [attachments] The resolved attachments
	 */

	/**
	 * Represents the resolved data of a received command interaction.
	 *
	 * @typedef {BaseInteractionResolvedData} CommandInteractionResolvedData
	 * @property {Collection<Snowflake, Message|APIMessage>} [messages] The resolved messages
	 */

	/**
	 * Represents an option of a received command interaction.
	 *
	 * @typedef {Object} CommandInteractionOption
	 * @property {string} name The name of the option
	 * @property {ApplicationCommandOptionType} type The type of the option
	 * @property {boolean} [autocomplete] Whether the autocomplete interaction is enabled for a
	 * {@link ApplicationCommandOptionType.String}, {@link ApplicationCommandOptionType.Integer} or
	 * {@link ApplicationCommandOptionType.Number} option
	 * @property {string|number|boolean} [value] The value of the option
	 * @property {CommandInteractionOption[]} [options] Additional options if this option is a
	 * subcommand (group)
	 * @property {User} [user] The resolved user
	 * @property {GuildMember|APIGuildMember} [member] The resolved member
	 * @property {GuildChannel|ThreadChannel|APIChannel} [channel] The resolved channel
	 * @property {Role|APIRole} [role] The resolved role
	 * @property {Attachment} [attachment] The resolved attachment
	 */

	/**
	 * Transforms an option received from the API.
	 *
	 * @param {APIApplicationCommandOption} option The received option
	 * @param {APIInteractionDataResolved} resolved The resolved interaction data
	 * @returns {CommandInteractionOption}
	 * @private
	 */
	transformOption(option: APIApplicationCommandOption, resolved: APIInteractionDataResolved): CommandInteractionOption {
		const result: CommandInteractionOption = {
			name: option.name,
			type: option.type,
		};

		if ('value' in option) result.value = (option as any).value;
		if ('options' in option)
			result.options = (option as any).options.map((opt: APIApplicationCommandOption) =>
				this.transformOption(opt, resolved),
			);

		if (resolved) {
			const user = resolved.users?.[(option as any).value as Snowflake];
			if (user) result.user = this.client.users._add(user);

			const member = resolved.members?.[(option as any).value as Snowflake];
			if (member) result.member = this.guild?.members._add({ user, ...member } as any) ?? member;

			const channel = resolved.channels?.[(option as any).value as Snowflake];
			if (channel) result.channel = this.client.channels._add(channel as any, this.guild) ?? channel;

			const role = resolved.roles?.[(option as any).value as Snowflake];
			if (role) result.role = this.guild?.roles._add(role as any) ?? role;

			const attachment = resolved.attachments?.[(option as any).value as Snowflake];
			if (attachment) result.attachment = new Attachment(attachment);
		}

		return result;
	}

	// These are here only for documentation purposes - they are implemented by InteractionResponses

	deferReply(_options?: any): any {}

	reply(_options?: any): any {}

	fetchReply(_options?: any): any {}

	editReply(_options?: any): any {}

	deleteReply(_options?: any): any {}

	followUp(_options?: any): any {}

	launchActivity(_options?: any): any {}

	showModal(_modal?: any, _options?: any): any {}

	awaitModalSubmit(_options?: any): any {}
}

InteractionResponses.applyToClass(CommandInteraction, ['deferUpdate', 'update']);
