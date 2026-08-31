import type { Client } from '../client/Client.js';
import { DiscordjsError, ErrorCodes } from '../errors/index.js';
import { BaseManager } from './BaseManager.js';

/**
 * Manages the API methods of a data model along with a collection of instances.
 *
 * @extends {BaseManager}
 * @abstract
 */
export abstract class DataManager<K = any, Holds = any, _R = any> extends BaseManager {
	public holds: { new (...args: any[]): Holds };

	constructor(client: Client, holds: { new (...args: any[]): Holds }) {
		super(client);
		this.holds = holds;
	}

	get cache(): unknown {
		throw new DiscordjsError(ErrorCodes.NotImplemented, 'get cache', this.constructor.name);
	}

	resolve(idOrInstance: unknown): Holds | null {
		if (idOrInstance instanceof this.holds) return idOrInstance;
		if (typeof idOrInstance === 'string') return ((this.cache as any)?.get(idOrInstance) as Holds) ?? null;
		return null;
	}

	resolveId(idOrInstance: unknown): K | null {
		if (idOrInstance instanceof this.holds) return (idOrInstance as any).id;
		if (typeof idOrInstance === 'string') return idOrInstance as unknown as K;
		return null;
	}

	override valueOf(): unknown {
		return this.cache;
	}
}
