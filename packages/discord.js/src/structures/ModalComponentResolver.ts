import { Collection } from '@ovencord/collection';
import type { APIChannel, APIGuildMember, APIRole, ChannelType, Snowflake } from 'discord-api-types/v10';
import { ComponentType } from 'discord-api-types/v10';
import type { Client } from '../client/Client.js';
import { DiscordjsTypeError, ErrorCodes } from '../errors/index.js';
import type { Attachment } from './Attachment.js';
import type { GuildChannel } from './GuildChannel.js';
import type { GuildMember } from './GuildMember.js';
import type { Role } from './Role.js';
import type { ThreadChannel } from './ThreadChannel.js';
import type { User } from './User.js';

export interface ModalSelectedMentionables {
	users: Collection<Snowflake, User>;
	members: Collection<Snowflake, GuildMember | APIGuildMember>;
	roles: Collection<Snowflake, Role | APIRole>;
}

export interface BaseModalData {
	type: ComponentType;
	customId: string;
}

export interface TextInputModalData extends BaseModalData {
	type: ComponentType.TextInput;
	value: string;
}

export interface SelectMenuModalData extends BaseModalData {
	type:
		| ComponentType.StringSelect
		| ComponentType.UserSelect
		| ComponentType.RoleSelect
		| ComponentType.MentionableSelect
		| ComponentType.ChannelSelect;
	values?: string[];
	users?: Collection<Snowflake, User>;
	members?: Collection<Snowflake, GuildMember | APIGuildMember>;
	roles?: Collection<Snowflake, Role | APIRole>;
	channels?: Collection<Snowflake, GuildChannel | ThreadChannel | APIChannel>;
}

export interface FileUploadModalData extends BaseModalData {
	type: ComponentType.FileUpload;
	attachments?: Collection<Snowflake, Attachment>;
}

export type ModalData =
	| TextInputModalData
	| SelectMenuModalData
	| FileUploadModalData
	| (BaseModalData & Record<string, unknown>);

export interface LabelModalData {
	component: ModalData;
}

export interface ActionRowModalData {
	components: ModalData[];
}

/**
 * A resolver for modal submit components
 */
export class ModalComponentResolver {
	public client!: Client;
	public readonly resolved!: Readonly<unknown> | null;
	public data: unknown[];
	public hoistedComponents: Collection<string, ModalData>;

	constructor(client: Client, components: unknown[], resolved?: unknown | null) {
		/**
		 * The client that instantiated this.
		 *
		 * @name ModalComponentResolver#client
		 * @type {Client}
		 * @readonly
		 */
		Object.defineProperty(this, 'client', { value: client });

		/**
		 * The interaction resolved data
		 *
		 * @name ModalComponentResolver#resolved
		 * @type {?Readonly<BaseInteractionResolvedData>}
		 */
		Object.defineProperty(this, 'resolved', { value: resolved ? Object.freeze(resolved) : null });

		/**
		 * The components within the modal
		 *
		 * @type {Array<ActionRowModalData|LabelModalData|TextDisplayModalData>}
		 */
		this.data = components ?? [];

		/**
		 * The bottom-level components of the interaction
		 *
		 * @type {Collection<string, ModalData>}
		 */
		this.hoistedComponents = (components ?? []).reduce<Collection<string, ModalData>>((accumulator, next) => {
			const row = next as { components?: { customId: string }[]; component?: { customId: string } };
			// For legacy support of action rows
			if (row && 'components' in row && Array.isArray(row.components)) {
				for (const component of row.components) accumulator.set(component.customId, component as ModalData);
			}

			// For label components
			if (row && 'component' in row && row.component) {
				accumulator.set(row.component.customId, row.component as ModalData);
			}

			return accumulator;
		}, new Collection<string, ModalData>());
	}

	/**
	 * Gets a component by custom id.
	 *
	 * @property {string} customId The custom id of the component.
	 * @returns {ModalData}
	 */
	getComponent(customId: string): ModalData {
		const component = this.hoistedComponents.get(customId);

		if (!component) throw new DiscordjsTypeError(ErrorCodes.ModalSubmitInteractionComponentNotFound, customId);

		return component;
	}

	/**
	 * Gets a component by custom id and property and checks its type.
	 *
	 * @param {string} customId The custom id of the component.
	 * @param {ComponentType[]} allowedTypes The allowed types of the component.
	 * @param {string[]} properties The properties to check for for `required`.
	 * @param {boolean} required Whether to throw an error if the component value(s) are not found.
	 * @returns {ModalData} The option, if found.
	 * @private
	 */
	_getTypedComponent(
		customId: string,
		allowedTypes: ComponentType[],
		properties: string[],
		required: boolean,
	): ModalData {
		const component = this.getComponent(customId);
		if (!allowedTypes.includes(component.type)) {
			throw new DiscordjsTypeError(
				ErrorCodes.ModalSubmitInteractionComponentType,
				customId,
				component.type,
				allowedTypes.join(', '),
			);
		} else if (
			required &&
			properties.every(
				(prop) =>
					(component as Record<string, unknown>)[prop] === null ||
					(component as Record<string, unknown>)[prop] === undefined,
			)
		) {
			throw new DiscordjsTypeError(ErrorCodes.ModalSubmitInteractionComponentEmpty, customId, component.type);
		}

		return component;
	}

	/**
	 * Gets the value of a text input component
	 *
	 * @param {string} customId The custom id of the text input component
	 * @returns {string}
	 */
	getTextInputValue(customId: string, required = false): string {
		const comp = this._getTypedComponent(
			customId,
			[ComponentType.TextInput],
			['value'],
			required,
		) as TextInputModalData;
		return comp.value;
	}

	/**
	 * Gets the values of a string select component
	 *
	 * @param {string} customId The custom id of the string select component
	 * @returns {string[]}
	 */
	getStringSelectValues(customId: string, required = false): string[] {
		const comp = this._getTypedComponent(
			customId,
			[ComponentType.StringSelect],
			['values'],
			required,
		) as SelectMenuModalData;
		return comp.values ?? [];
	}

	/**
	 * Gets users component
	 *
	 * @param {string} customId The custom id of the component
	 * @param {boolean} [required=false] Whether to throw an error if the component value is not found or empty
	 * @returns {?Collection<Snowflake, User>} The selected users, or null if none were selected and not required
	 */
	getSelectedUsers(customId: string, required = false): Collection<Snowflake, User> | null {
		const component = this._getTypedComponent(
			customId,
			[ComponentType.UserSelect, ComponentType.MentionableSelect],
			['users'],
			required,
		) as SelectMenuModalData;
		return component.users ?? null;
	}

	/**
	 * Gets roles component
	 *
	 * @param {string} customId The custom id of the component
	 * @param {boolean} [required=false] Whether to throw an error if the component value is not found or empty
	 * @returns {?Collection<Snowflake, Role|APIRole>} The selected roles, or null if none were selected and not required
	 */
	getSelectedRoles(customId: string, required = false): Collection<Snowflake, Role | APIRole> | null {
		const component = this._getTypedComponent(
			customId,
			[ComponentType.RoleSelect, ComponentType.MentionableSelect],
			['roles'],
			required,
		) as SelectMenuModalData;
		return component.roles ?? null;
	}

	/**
	 * Gets channels component
	 *
	 * @param {string} customId The custom id of the component
	 * @param {boolean} [required=false] Whether to throw an error if the component value is not found or empty
	 * @param {ChannelType[]} [channelTypes=[]] The allowed types of channels. If empty, all channel types are allowed.
	 * @returns {?Collection<Snowflake, GuildChannel|ThreadChannel|APIChannel>} The selected channels, or null if none were selected and not required
	 */
	getSelectedChannels(
		customId: string,
		required = false,
		channelTypes: ChannelType[] = [],
	): Collection<Snowflake, GuildChannel | ThreadChannel | APIChannel> | null {
		const component = this._getTypedComponent(
			customId,
			[ComponentType.ChannelSelect],
			['channels'],
			required,
		) as SelectMenuModalData;
		const channels = component.channels;
		if (channels && channelTypes.length > 0) {
			for (const channel of channels.values()) {
				if (!channelTypes.includes(channel.type as ChannelType)) {
					throw new DiscordjsTypeError(
						ErrorCodes.ModalSubmitInteractionComponentInvalidChannelType,
						customId,
						channel.type,
						channelTypes.join(', '),
					);
				}
			}
		}

		return channels ?? null;
	}

	/**
	 * Gets members component
	 *
	 * @param {string} customId The custom id of the component
	 * @returns {?Collection<Snowflake, GuildMember|APIGuildMember>} The selected members, or null if none were selected or the users were not present in the guild
	 */
	getSelectedMembers(customId: string): Collection<Snowflake, GuildMember | APIGuildMember> | null {
		const component = this._getTypedComponent(
			customId,
			[ComponentType.UserSelect, ComponentType.MentionableSelect],
			['members'],
			false,
		) as SelectMenuModalData;
		return component.members ?? null;
	}

	/**
	 * Gets mentionables component
	 *
	 * @param {string} customId The custom id of the component
	 * @param {boolean} [required=false] Whether to throw an error if the component value is not found or empty
	 * @returns {?ModalSelectedMentionables} The selected mentionables, or null if none were selected and not required
	 */
	getSelectedMentionables(customId: string, required = false): ModalSelectedMentionables | null {
		const component = this._getTypedComponent(
			customId,
			[ComponentType.MentionableSelect],
			['users', 'members', 'roles'],
			required,
		) as SelectMenuModalData;

		if (component.users || component.members || component.roles) {
			return {
				users: component.users ?? new Collection(),
				members: component.members ?? new Collection(),
				roles: component.roles ?? new Collection(),
			};
		}

		return null;
	}

	/**
	 * Gets file upload component
	 *
	 * @param {string} customId The custom id of the component
	 * @param {boolean} [required=false] Whether to throw an error if the component value is not found or empty
	 * @returns {?Collection<Snowflake, Attachment>} The uploaded files, or null if none were uploaded and not required
	 */
	getUploadedFiles(customId: string, required = false): Collection<Snowflake, Attachment> | null {
		const component = this._getTypedComponent(
			customId,
			[ComponentType.FileUpload],
			['attachments'],
			required,
		) as FileUploadModalData;
		return component.attachments ?? null;
	}
}
