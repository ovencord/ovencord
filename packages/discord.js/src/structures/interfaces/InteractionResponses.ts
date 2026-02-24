import { makeURLSearchParams } from '@ovencord/rest';
import { isJSONEncodable } from '@ovencord/util';
import { InteractionResponseType, InteractionType, MessageFlags, Routes } from 'discord-api-types/v10';
import { DiscordjsError, ErrorCodes } from '../../errors/index.js';
import { MessageFlagsBitField } from '../../util/MessageFlagsBitField.js';
import { InteractionCallbackResponse } from '../InteractionCallbackResponse.js';
import { InteractionCollector } from '../InteractionCollector.js';
import { MessagePayload } from '../MessagePayload.js';

/**
 * Interface for classes that support shared interaction response types.
 *
 * @interface
 */
export class InteractionResponses {
	public client: any;
	public id: any;
	public token: any;
	public webhook: any;
	public deferred: any;
	public ephemeral: any;
	public replied: any;

	/**
	 * Defers the reply to this interaction.
	 *
	 * @param {InteractionDeferReplyOptions} [options] Options for deferring the reply to this interaction
	 * @returns {Promise<InteractionCallbackResponse|undefined>}
	 */
	async deferReply(options: any = {}) {
		if (this.deferred || this.replied) throw new DiscordjsError(ErrorCodes.InteractionAlreadyReplied);

		const resolvedFlags = new MessageFlagsBitField(options.flags);

		const response = await this.client.rest.post(Routes.interactionCallback(this.id, this.token), {
			body: {
				type: InteractionResponseType.DeferredChannelMessageWithSource,
				data: {
					flags: resolvedFlags.bitfield,
				},
			},
			auth: false,
			query: makeURLSearchParams({ with_response: options.withResponse ?? false }),
		});

		this.deferred = true;
		this.ephemeral = resolvedFlags.has(MessageFlags.Ephemeral);

		return options.withResponse ? new InteractionCallbackResponse(this.client, response) : undefined;
	}

	/**
	 * Creates a reply to this interaction.
	 *
	 * @param {string|MessagePayload|InteractionReplyOptions} options The options for the reply
	 * @returns {Promise<InteractionCallbackResponse|undefined>}
	 */
	async reply(options: any) {
		if (this.deferred || this.replied) throw new DiscordjsError(ErrorCodes.InteractionAlreadyReplied);

		let messagePayload: any;
		if (options instanceof MessagePayload) messagePayload = options;
		else messagePayload = MessagePayload.create(this, options);

		const { body: data, files } = await messagePayload.resolveBody().resolveFiles();

		const response = await this.client.rest.post(Routes.interactionCallback(this.id, this.token), {
			body: {
				type: InteractionResponseType.ChannelMessageWithSource,
				data,
			},
			files,
			auth: false,
			query: makeURLSearchParams({ with_response: options.withResponse ?? options.fetchReply ?? false }),
		});

		this.ephemeral = Boolean(data.flags & MessageFlags.Ephemeral);
		this.replied = true;

		if (options.fetchReply) return this.fetchReply();
		return options.withResponse ? new InteractionCallbackResponse(this.client, response) : undefined;
	}

	/**
	 * Fetches a reply to this interaction.
	 *
	 * @see Webhook#fetchMessage
	 * @param {Snowflake|'@original'} [message='@original'] The response to fetch
	 * @returns {Promise<Message>}
	 */
	async fetchReply(message: string = '@original') {
		return this.webhook.fetchMessage(message);
	}

	/**
	 * Edits a reply to this interaction.
	 *
	 * @see Webhook#editMessage
	 * @param {string|MessagePayload|InteractionEditReplyOptions} options The new options for the message
	 * @returns {Promise<Message>}
	 */
	async editReply(options: any) {
		if (!this.deferred && !this.replied) throw new DiscordjsError(ErrorCodes.InteractionNotReplied);
		const msg = await this.webhook.editMessage(options.message ?? '@original', options);
		this.replied = true;
		return msg;
	}

	/**
	 * Deletes a reply to this interaction.
	 *
	 * @see Webhook#deleteMessage
	 * @param {MessageResolvable|'@original'} [message='@original'] The response to delete
	 * @returns {Promise<void>}
	 */
	async deleteReply(message: string = '@original') {
		if (!this.deferred && !this.replied) throw new DiscordjsError(ErrorCodes.InteractionNotReplied);
		await this.webhook.deleteMessage(message);
	}

	/**
	 * Send a follow-up message to this interaction.
	 *
	 * @param {string|MessagePayload|InteractionReplyOptions} options The options for the reply
	 * @returns {Promise<Message>}
	 */
	async followUp(options: any) {
		if (!this.deferred && !this.replied) throw new DiscordjsError(ErrorCodes.InteractionNotReplied);
		const msg = await this.webhook.send(options);
		this.replied = true;
		return msg;
	}

	/**
	 * Defers an update to the message to which the component was attached.
	 *
	 * @param {InteractionDeferUpdateOptions} [options] Options for deferring the update to this interaction
	 * @returns {Promise<InteractionCallbackResponse|undefined>}
	 */
	async deferUpdate(options: any = {}) {
		if (this.deferred || this.replied) throw new DiscordjsError(ErrorCodes.InteractionAlreadyReplied);
		const response = await this.client.rest.post(Routes.interactionCallback(this.id, this.token), {
			body: {
				type: InteractionResponseType.DeferredMessageUpdate,
			},
			auth: false,
			query: makeURLSearchParams({ with_response: options.withResponse ?? false }),
		});
		this.deferred = true;

		return options.withResponse ? new InteractionCallbackResponse(this.client, response) : undefined;
	}

	/**
	 * Updates the original message of the component on which the interaction was received on.
	 *
	 * @param {string|MessagePayload|InteractionUpdateOptions} [options] The options for the updated message
	 * @returns {Promise<InteractionCallbackResponse|undefined>}
	 */
	async update(options: any = {}) {
		let messagePayload: any;
		if (options instanceof MessagePayload) messagePayload = options;
		else messagePayload = MessagePayload.create(this, options);

		const { body: data, files } = await messagePayload.resolveBody().resolveFiles();

		const response = await this.client.rest.post(Routes.interactionCallback(this.id, this.token), {
			body: {
				type: InteractionResponseType.UpdateMessage,
				data,
			},
			files,
			auth: false,
			query: makeURLSearchParams({ with_response: options.withResponse ?? options.fetchReply ?? false }),
		});
		this.replied = true;

		if (options.fetchReply) return this.fetchReply();
		return options.withResponse ? new InteractionCallbackResponse(this.client, response) : undefined;
	}

	/**
	 * Launches this application's activity, if enabled
	 *
	 * @param {LaunchActivityOptions} [options={}] Options for launching the activity
	 * @returns {Promise<InteractionCallbackResponse|undefined>}
	 */
	async launchActivity({ withResponse }: any = {}) {
		if (this.deferred || this.replied) throw new DiscordjsError(ErrorCodes.InteractionAlreadyReplied);
		const response = await this.client.rest.post(Routes.interactionCallback(this.id, this.token), {
			query: makeURLSearchParams({ with_response: withResponse ?? false }),
			body: {
				type: InteractionResponseType.LaunchActivity,
			},
			auth: false,
		});
		this.replied = true;

		return withResponse ? new InteractionCallbackResponse(this.client, response) : undefined;
	}

	/**
	 * Shows a modal component
	 *
	 * @param {ModalBuilder|ModalComponentData|APIModalInteractionResponseCallbackData} modal The modal to show
	 * @param {ShowModalOptions} [options={}] The options for sending this interaction response
	 * @returns {Promise<InteractionCallbackResponse|undefined>}
	 */
	async showModal(modal: any, options: any = {}) {
		if (this.deferred || this.replied) throw new DiscordjsError(ErrorCodes.InteractionAlreadyReplied);
		const response = await this.client.rest.post(Routes.interactionCallback(this.id, this.token), {
			body: {
				type: InteractionResponseType.Modal,
				data: isJSONEncodable(modal) ? modal.toJSON() : this.client.options.jsonTransformer(modal),
			},
			auth: false,
			query: makeURLSearchParams({ with_response: options.withResponse ?? false }),
		});
		this.replied = true;

		return options.withResponse ? new InteractionCallbackResponse(this.client, response) : undefined;
	}

	/**
	 * Collects a single modal submit interaction that passes the filter.
	 * The Promise will reject if the time expires.
	 *
	 * @param {AwaitModalSubmitOptions} options Options to pass to the internal collector
	 * @returns {Promise<ModalSubmitInteraction>}
	 */
	async awaitModalSubmit(options: any) {
		if (typeof options.time !== 'number') throw new DiscordjsError(ErrorCodes.InvalidType, 'time', 'number');
		const _options = { ...options, max: 1, interactionType: InteractionType.ModalSubmit };
		return new Promise((resolve, reject) => {
			const collector = new InteractionCollector(this.client, _options);
			collector.once('end', (interactions, reason) => {
				const interaction = interactions.first();
				if (interaction) resolve(interaction);
				else reject(new DiscordjsError(ErrorCodes.InteractionCollectorError, reason));
			});
		});
	}

	static applyToClass(structure: any, ignore: any[] = []) {
		const props = [
			'deferReply',
			'reply',
			'fetchReply',
			'editReply',
			'deleteReply',
			'followUp',
			'deferUpdate',
			'update',
			'launchActivity',
			'showModal',
			'awaitModalSubmit',
		];

		for (const prop of props) {
			if (ignore.includes(prop)) continue;
			Object.defineProperty(
				structure.prototype,
				prop,
				Object.getOwnPropertyDescriptor(InteractionResponses.prototype, prop) as PropertyDescriptor,
			);
		}
	}
}
