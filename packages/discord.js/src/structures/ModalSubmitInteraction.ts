import { Collection } from '@ovencord/collection';
import { lazy } from '@ovencord/util';

import type {
	APIInteractionDataResolved,
	APIModalSubmission,
	APIModalSubmitInteraction,
	Snowflake,
} from 'discord-api-types/v10';

import type { Client } from '../client/Client.js';
import { transformResolved } from '../util/Util.js';
import type { Attachment } from './Attachment.js';
import type { BaseChannel } from './BaseChannel.js';
import { BaseInteraction } from './BaseInteraction.js';
import type { GuildMember } from './GuildMember.js';
import { InteractionWebhook } from './InteractionWebhook.js';
import { InteractionResponses } from './interfaces/InteractionResponses.js';
import type { Message } from './Message.js';
import { ModalComponentResolver } from './ModalComponentResolver.js';
import type { Role } from './Role.js';
import type { User } from './User.js';

const getMessage = lazy(() => require('./Message.js').Message);
const getAttachment = lazy(() => require('./Attachment.js').Attachment);

/**
 * @typedef {Object} BaseModalData
 * @property {ComponentType} type The component type of the component
 * @property {number} id The id of the component
 */

/**
 * @typedef {BaseModalData} SelectMenuModalData
 * @property {string} customId The custom id of the component
 * @property {string[]} values The values of the component
 * @property {Collection<Snowflake, GuildMember|APIGuildMember>} [members] The resolved members
 * @property {Collection<Snowflake, User|APIUser>} [users] The resolved users
 * @property {Collection<Snowflake, Role|APIRole>} [roles] The resolved roles
 * @property {Collection<Snowflake, BaseChannel|APIChannel>} [channels] The resolved channels
 */

/**
 * @typedef {BaseModalData} FileUploadModalData
 * @property {string} customId The custom id of the file upload
 * @property {Snowflake[]} values The values of the file upload
 * @property {Collection<Snowflake, Attachment>} [attachments] The resolved attachments
 */

/**
 * @typedef {BaseModalData} TextInputModalData
 * @property {string} customId The custom id of the component
 * @property {string} value The value of the component
 */

/**
 * @typedef {BaseModalData} TextDisplayModalData
 */

/**
 * @typedef {SelectMenuModalData|TextInputModalData|FileUploadModalData} ModalData
 */

/**
 * @typedef {BaseModalData} LabelModalData
 * @property {ModalData} component The component within the label
 */

/**
 * @typedef {BaseModalData} ActionRowModalData
 * @property {TextInputModalData[]} components The components of this action row
 */

/**
 * Represents a modal interaction
 *
 * @extends {BaseInteraction}
 * @implements {InteractionResponses}
 */
export class ModalSubmitInteraction extends BaseInteraction {
	public customId: string;
	public message: Message | null;
	public components: ModalComponentResolver;
	public fields: ModalComponentResolver;
	public deferred: boolean;
	public replied: boolean;
	public ephemeral: boolean | null;
	public webhook: InteractionWebhook;
	constructor(client: Client, data: APIModalSubmitInteraction) {
		super(client, data);
		/**
		 * The custom id of the modal.
		 *
		 * @type {string}
		 */
		this.customId = data.data.custom_id;

		if ('message' in data) {
			/**
			 * The message associated with this interaction
			 *
			 * @type {?Message}
			 */
			this.message = this.channel?.messages._add(data.message) ?? new (getMessage())(this.client, data.message);
		} else {
			this.message = null;
		}

		/**
		 * The components within the modal
		 *
		 * @type {ModalComponentResolver}
		 */
		this.components = new ModalComponentResolver(
			this.client,
			(data.data as APIModalSubmission).components?.map((component: any) =>
				this.transformComponent(component, (data.data as APIModalSubmission).resolved),
			),
			transformResolved(
				{ client: this.client, guild: this.guild, channel: this.channel },
				(data.data as APIModalSubmission).resolved as APIInteractionDataResolved,
			),
		);

		/**
		 * The fields within the modal (alias for components).
		 * Provides backward compatibility with the classic discord.js API.
		 *
		 * @type {ModalComponentResolver}
		 */
		this.fields = this.components;

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
	 * Transforms component data to discord.js-compatible data
	 *
	 * @param {*} rawComponent The data to transform
	 * @param {APIInteractionDataResolved} resolved The resolved data for the interaction
	 * @returns {ModalData[]}
	 * @private
	 */
	// @ts-expect-error
	transformComponent(rawComponent: any, resolved: APIInteractionDataResolved | undefined): ModalData[] | any {
		if ('components' in rawComponent) {
			return {
				type: rawComponent.type,
				id: rawComponent.id,
				// @ts-expect-error
				components: rawComponent.components.map((component) => this.transformComponent(component, resolved)),
			};
		}

		if ('component' in rawComponent) {
			return {
				type: rawComponent.type,
				id: rawComponent.id,
				component: this.transformComponent(rawComponent.component, resolved),
			};
		}

		const data: any = {
			type: rawComponent.type,
			id: rawComponent.id,
		};

		// Text display components do not have custom ids.
		if ('custom_id' in rawComponent) data.customId = rawComponent.custom_id;

		if ('value' in rawComponent) data.value = rawComponent.value;

		if (rawComponent.values) {
			data.values = rawComponent.values;
			if (resolved) {
				const { members, users, channels, roles, attachments } = resolved;
				const valueSet = new Set(rawComponent.values as string[]);

				if (users) {
					data.users = new Collection<Snowflake, User>();

					for (const [id, user] of Object.entries(users)) {
						if (valueSet.has(id)) {
							data.users.set(id as Snowflake, this.client.users._add(user));
						}
					}
				}

				if (channels) {
					data.channels = new Collection<Snowflake, BaseChannel | any>();

					for (const [id, apiChannel] of Object.entries(channels)) {
						if (valueSet.has(id)) {
							data.channels.set(
								id as Snowflake,
								this.client.channels._add(apiChannel as any, this.guild) ?? apiChannel,
							);
						}
					}
				}

				if (members) {
					data.members = new Collection<Snowflake, GuildMember | any>();

					for (const [id, member] of Object.entries(members)) {
						if (valueSet.has(id)) {
							const user = users?.[id];
							data.members.set(id as Snowflake, this.guild?.members._add({ user, ...member } as any) ?? member);
						}
					}
				}

				if (roles) {
					data.roles = new Collection<Snowflake, Role | any>();

					for (const [id, role] of Object.entries(roles)) {
						if (valueSet.has(id)) {
							data.roles.set(id as Snowflake, this.guild?.roles._add(role as any) ?? role);
						}
					}
				}

				if (attachments) {
					data.attachments = new Collection<Snowflake, Attachment>();
					for (const [id, attachment] of Object.entries(attachments)) {
						if (valueSet.has(id)) {
							data.attachments.set(id as Snowflake, new (getAttachment() as any)(attachment));
						}
					}
				}
			}
		}

		return data;
	}

	/**
	 * Whether this is from a {@link MessageComponentInteraction}.
	 *
	 * @returns {boolean}
	 */
	isFromMessage() {
		return Boolean(this.message);
	}

	// These are here only for documentation purposes - they are implemented by InteractionResponses

	deferReply(_options?: any): any {}

	reply(_options?: any): any {}

	fetchReply(_options?: any): any {}

	editReply(_options?: any): any {}

	deleteReply(_options?: any): any {}

	followUp(_options?: any): any {}

	deferUpdate(_options?: any): any {}

	update(_options?: any): any {}

	launchActivity(_options?: any): any {}
}

InteractionResponses.applyToClass(ModalSubmitInteraction, ['showModal'] as any);
