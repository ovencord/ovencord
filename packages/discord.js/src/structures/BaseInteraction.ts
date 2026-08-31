import { Collection } from '@ovencord/collection';
import { DiscordSnowflake } from '@ovencord/util';
import {
	type APIInteraction,
	type APIInteractionGuildMember,
	ApplicationCommandType,
	ComponentType,
	type InteractionContextType,
	InteractionType,
	type Locale,
	type Snowflake,
} from 'discord-api-types/v10';
import type { Client } from '../client/Client.js';
import { SelectMenuTypes } from '../util/Constants.js';
import { PermissionsBitField } from '../util/PermissionsBitField.js';
import { AuthorizingIntegrationOwners } from './AuthorizingIntegrationOwners.js';
import { Base } from './Base.js';
import type { Entitlement } from './Entitlement.js';
import type { GuildMember } from './GuildMember.js';
import type { User } from './User.js';

/**
 * Represents an interaction.
 *
 * @extends {Base}
 * @abstract
 */
export class BaseInteraction extends Base {
	/**
	 * The interaction's type
	 */
	public type: InteractionType;

	/**
	 * The interaction's id
	 */
	public id: Snowflake;

	/**
	 * The interaction's token
	 * @readonly
	 */
	public readonly token: string;

	/**
	 * The application's id
	 */
	public applicationId: Snowflake;

	/**
	 * The id of the channel this interaction was sent in
	 */
	public channelId: Snowflake | null;

	/**
	 * The id of the guild this interaction was sent in
	 */
	public guildId: Snowflake | null;

	/**
	 * The user who created this interaction
	 */
	public user: User;

	/**
	 * If this interaction was sent in a guild, the member which sent it
	 */
	public member: GuildMember | APIInteractionGuildMember | null;

	/**
	 * The version
	 */
	public version: number;

	/**
	 * Set of permissions the application or bot has within the channel the interaction was sent from
	 */
	public appPermissions: Readonly<PermissionsBitField>;

	/**
	 * The permissions of the member, if one exists, in the channel this interaction was executed in
	 */
	public memberPermissions: Readonly<PermissionsBitField> | null;

	/**
	 * The locale of the user who invoked this interaction
	 */
	public locale: Locale;

	/**
	 * The preferred locale from the guild this interaction was sent in
	 */
	public guildLocale: Locale | null;

	/**
	 * The entitlements for the invoking user, representing access to premium SKUs
	 */
	public entitlements: Collection<Snowflake, Entitlement>;

	/**
	 * Mapping of integration types that the application was authorized for the related user or guild ids
	 */
	public authorizingIntegrationOwners: AuthorizingIntegrationOwners;

	/**
	 * Context where the interaction was triggered from
	 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-authorizing-integration-owners-object}
	 */
	public context: InteractionContextType | null;

	/**
	 * Attachment size limit in bytes
	 */
	public attachmentSizeLimit: number;

	public commandType: ApplicationCommandType | null;
	public componentType: ComponentType | null;

	constructor(client: Client, data: APIInteraction) {
		super(client);

		this.type = data.type;

		Object.defineProperty(this, 'token', { value: data.token, configurable: true, writable: true });

		this.applicationId = data.application_id;

		this.channelId = data.channel?.id ?? null;

		this.guildId = data.guild_id ?? null;

		this.user = this.client.users._add(data.user ?? (data as any).member?.user);

		this.member = data.member ? (this.guild?.members._add(data.member) ?? data.member) : null;

		this.version = data.version;

		this.appPermissions = new PermissionsBitField(data.app_permissions).freeze();

		this.memberPermissions = data.member?.permissions
			? new PermissionsBitField(data.member.permissions).freeze()
			: null;

		this.locale = (data as Extract<APIInteraction, { locale: Locale }>).locale;

		this.guildLocale = (data as any).guild_locale ?? null;

		this.entitlements = ((data as any).entitlements ?? []).reduce(
			(coll: Collection<Snowflake, Entitlement>, entitlement: any) =>
				coll.set(entitlement.id, this.client.application.entitlements._add(entitlement)),
			new Collection<Snowflake, Entitlement>(),
		);

		this.authorizingIntegrationOwners = new AuthorizingIntegrationOwners(
			this.client,
			(data as any).authorizing_integration_owners,
		);

		this.context = (data as any).context ?? null;

		this.attachmentSizeLimit = (data as any).attachment_size_limit;

		this.commandType = (data as any).data?.type ?? null;
		this.componentType = (data as any).data?.component_type ?? null;
	}

	/**
	 * The timestamp the interaction was created at
	 *
	 * @type {number}
	 * @readonly
	 */
	get createdTimestamp() {
		return DiscordSnowflake.timestampFrom(this.id);
	}

	/**
	 * The time the interaction was created at
	 *
	 * @type {Date}
	 * @readonly
	 */
	get createdAt() {
		return new Date(this.createdTimestamp);
	}

	/**
	 * The channel this interaction was sent in
	 *
	 * @type {?TextBasedChannels}
	 * @readonly
	 */
	get channel() {
		return this.client.channels.cache.get(this.channelId) ?? null;
	}

	/**
	 * The guild this interaction was sent in
	 *
	 * @type {?Guild}
	 * @readonly
	 */
	get guild() {
		return this.client.guilds.cache.get(this.guildId) ?? null;
	}

	/**
	 * Indicates whether this interaction is received from a guild.
	 *
	 * @returns {boolean}
	 */
	inGuild() {
		return Boolean(this.guildId && this.member);
	}

	/**
	 * Indicates whether this interaction is received from a cached guild.
	 *
	 * @returns {boolean}
	 */
	inCachedGuild() {
		return Boolean(this.guild && this.member);
	}

	/**
	 * Indicates whether or not this interaction is received from an uncached guild.
	 *
	 * @returns {boolean}
	 */
	inRawGuild() {
		return Boolean(this.guildId && !this.guild && this.member);
	}

	/**
	 * Indicates whether this interaction is an {@link AutocompleteInteraction}
	 *
	 * @returns {boolean}
	 */
	isAutocomplete() {
		return this.type === InteractionType.ApplicationCommandAutocomplete;
	}

	/**
	 * Indicates whether this interaction is a {@link CommandInteraction}
	 *
	 * @returns {boolean}
	 */
	isCommand() {
		return this.type === InteractionType.ApplicationCommand;
	}

	/**
	 * Indicates whether this interaction is a {@link ChatInputCommandInteraction}.
	 *
	 * @returns {boolean}
	 */
	isChatInputCommand() {
		return this.type === InteractionType.ApplicationCommand && this.commandType === ApplicationCommandType.ChatInput;
	}

	/**
	 * Indicates whether this interaction is a {@link ContextMenuCommandInteraction}
	 *
	 * @returns {boolean}
	 */
	isContextMenuCommand() {
		return (
			this.type === InteractionType.ApplicationCommand &&
			[ApplicationCommandType.User, ApplicationCommandType.Message].includes(this.commandType)
		);
	}

	/**
	 * Indicates whether this interaction is a {@link PrimaryEntryPointCommandInteraction}
	 *
	 * @returns {boolean}
	 */
	isPrimaryEntryPointCommand() {
		return (
			this.type === InteractionType.ApplicationCommand && this.commandType === ApplicationCommandType.PrimaryEntryPoint
		);
	}

	/**
	 * Indicates whether this interaction is a {@link MessageComponentInteraction}
	 *
	 * @returns {boolean}
	 */
	isMessageComponent() {
		return this.type === InteractionType.MessageComponent;
	}

	/**
	 * Indicates whether this interaction is a {@link ModalSubmitInteraction}
	 *
	 * @returns {boolean}
	 */
	isModalSubmit() {
		return this.type === InteractionType.ModalSubmit;
	}

	/**
	 * Indicates whether this interaction is a {@link UserContextMenuCommandInteraction}
	 *
	 * @returns {boolean}
	 */
	isUserContextMenuCommand() {
		return this.isContextMenuCommand() && this.commandType === ApplicationCommandType.User;
	}

	/**
	 * Indicates whether this interaction is a {@link MessageContextMenuCommandInteraction}
	 *
	 * @returns {boolean}
	 */
	isMessageContextMenuCommand() {
		return this.isContextMenuCommand() && this.commandType === ApplicationCommandType.Message;
	}

	/**
	 * Indicates whether this interaction is a {@link ButtonInteraction}.
	 *
	 * @returns {boolean}
	 */
	isButton() {
		return this.type === InteractionType.MessageComponent && this.componentType === ComponentType.Button;
	}

	/**
	 * Indicates whether this interaction is a select menu of any known type.
	 *
	 * @returns {boolean}
	 */
	isSelectMenu() {
		return this.type === InteractionType.MessageComponent && SelectMenuTypes.includes(this.componentType);
	}

	/**
	 * Indicates whether this interaction is a {@link StringSelectMenuInteraction}.
	 *
	 * @returns {boolean}
	 */
	isStringSelectMenu() {
		return this.type === InteractionType.MessageComponent && this.componentType === ComponentType.StringSelect;
	}

	/**
	 * Indicates whether this interaction is a {@link UserSelectMenuInteraction}
	 *
	 * @returns {boolean}
	 */
	isUserSelectMenu() {
		return this.type === InteractionType.MessageComponent && this.componentType === ComponentType.UserSelect;
	}

	/**
	 * Indicates whether this interaction is a {@link RoleSelectMenuInteraction}
	 *
	 * @returns {boolean}
	 */
	isRoleSelectMenu() {
		return this.type === InteractionType.MessageComponent && this.componentType === ComponentType.RoleSelect;
	}

	/**
	 * Indicates whether this interaction is a {@link ChannelSelectMenuInteraction}
	 *
	 * @returns {boolean}
	 */
	isChannelSelectMenu() {
		return this.type === InteractionType.MessageComponent && this.componentType === ComponentType.ChannelSelect;
	}

	/**
	 * Indicates whether this interaction is a {@link MentionableSelectMenuInteraction}
	 *
	 * @returns {boolean}
	 */
	isMentionableSelectMenu() {
		return this.type === InteractionType.MessageComponent && this.componentType === ComponentType.MentionableSelect;
	}

	/**
	 * Indicates whether this interaction can be replied to.
	 *
	 * @returns {boolean}
	 */
	isRepliable() {
		return ![InteractionType.Ping, InteractionType.ApplicationCommandAutocomplete].includes(this.type);
	}
}
