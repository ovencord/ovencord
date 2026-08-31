import type { Collection } from '@ovencord/collection';
import type { Snowflake } from 'discord-api-types/v10';
import type { Client } from '../client/Client.js';
import { DiscordjsError, ErrorCodes } from '../errors/index.js';
import { BaseManager } from './BaseManager.js';

/**
 * Manages the API methods of a data model along with a collection of instances.
 *
 * @extends {BaseManager}
 * @abstract
 */
export abstract class DataManager<K extends Snowflake | string = Snowflake, Holds = any, R = any> extends BaseManager {
	// biome-ignore lint/suspicious/noExplicitAny: holds class reference
	public holds: any;

	// biome-ignore lint/suspicious/noExplicitAny: holds class reference
	constructor(client: Client, holds: any) {
		super(client);
		this.holds = holds;
	}

	get cache(): Collection<K, Holds> {
		throw new DiscordjsError(ErrorCodes.NotImplemented, 'get cache', this.constructor.name);
	}

	resolve(idOrInstance: Holds | K | R | null | undefined): Holds | null {
		if (idOrInstance instanceof this.holds) return idOrInstance;
		if (typeof idOrInstance === 'string') return this.cache.get(idOrInstance as K) ?? null;
		return null;
	}

	resolveId(idOrInstance: Holds | K | R | null | undefined): K | null {
		if (idOrInstance instanceof this.holds) return (idOrInstance as any).id;
		if (typeof idOrInstance === 'string') return idOrInstance as K;
		return null;
	}

	override valueOf(): Collection<K, Holds> {
		return this.cache;
	}
}
