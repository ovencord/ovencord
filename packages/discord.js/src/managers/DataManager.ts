import type { Client } from '../client/Client.js';
import { DiscordjsError, ErrorCodes } from '../errors/index.js';
import { BaseManager } from './BaseManager.js';

/**
 * Manages the API methods of a data model along with a collection of instances.
 *
 * @extends {BaseManager}
 * @abstract
 */
export abstract class DataManager extends BaseManager {
	public holds: { new (...args: any[]): any };

	constructor(client: Client, holds: { new (...args: any[]): any }) {
		super(client);
		this.holds = holds;
	}

	get cache(): unknown {
		throw new DiscordjsError(ErrorCodes.NotImplemented, 'get cache', this.constructor.name);
	}

	resolve(idOrInstance: unknown): any {
		if (idOrInstance instanceof this.holds) return idOrInstance;
		if (typeof idOrInstance === 'string') return (this.cache as any).get(idOrInstance) ?? null;
		return null;
	}

	resolveId(idOrInstance: unknown): string | null {
		if (idOrInstance instanceof this.holds) return (idOrInstance as any).id;
		if (typeof idOrInstance === 'string') return idOrInstance;
		return null;
	}

	override valueOf(): unknown {
		return this.cache;
	}
}
