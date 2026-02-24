import { InteractionCallback } from './InteractionCallback.js';
import { InteractionCallbackResource } from './InteractionCallbackResource.js';

/**
 * Represents an interaction's response
 */
export class InteractionCallbackResponse {
	public interaction: any;
	public resource: any;
	constructor(client: any, data: any) {
		/**
		 * The client that instantiated this
		 *
		 * @name InteractionCallbackResponse#client
		 * @type {Client}
		 * @readonly
		 */
		Object.defineProperty(this, 'client', { value: client });

		/**
		 * The interaction object associated with the interaction callback response
		 *
		 * @type {InteractionCallback}
		 */
		this.interaction = new InteractionCallback(client, data.interaction);

		/**
		 * The resource that was created by the interaction response
		 *
		 * @type {?InteractionCallbackResource}
		 */
		this.resource = data.resource ? new InteractionCallbackResource(client, data.resource) : null;
	}

	/**
	 * Creates a message component collector for the message created by this interaction response.
	 *
	 * @param {MessageComponentCollectorOptions} [options] Options to send to the collector
	 * @returns {InteractionCollector}
	 */
	createMessageComponentCollector(options: any = {}) {
		return this.resource?.message?.createMessageComponentCollector(options);
	}

	/**
	 * Collects a single component interaction that passes the filter.
	 * The Promise will reject if the time expires.
	 *
	 * @param {AwaitMessageComponentOptions} [options] Options to pass to the internal collector
	 * @returns {Promise<MessageComponentInteraction>}
	 */
	awaitMessageComponent(options: any = {}) {
		return this.resource?.message?.awaitMessageComponent(options);
	}
}
