import type { Client } from '../client/Client.js';

export interface BaseFetchOptions {
	cache?: boolean;
	force?: boolean;
}

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
