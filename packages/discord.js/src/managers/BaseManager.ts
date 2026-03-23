import type { Client } from '../client/Client.js';

/**
 * Manages the API methods of a data model.
 *
 * @abstract
 */
export abstract class BaseManager {
	public client: Client;

	constructor(client: Client) {
		this.client = client;
	}
}
