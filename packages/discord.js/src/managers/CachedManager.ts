import type { Collection } from '@ovencord/collection';
import type { Client } from '../client/Client.js';
import { MakeCacheOverrideSymbol } from '../util/Symbols.js';
import { DataManager } from './DataManager.js';

/**
 * Manages the API methods of a data model with a mutable cache of instances.
 *
 * @extends {DataManager}
 * @abstract
 */
export abstract class CachedManager extends DataManager {
	public _cache: Collection<any, any>;
	public holds: any;

	constructor(client: Client, holds: any, iterable?: Iterable<any>) {
		super(client, holds);

		this.holds = holds;

		Object.defineProperty(this, '_cache', {
			value: this.client.options.makeCache({
				holds: this.holds,
				manager: this.constructor,
				managerType: (this.constructor as any)[MakeCacheOverrideSymbol] ?? this.constructor,
			}),
		});

		if (iterable) {
			for (const item of iterable) {
				this._add(item);
			}
		}
	}

	override get cache(): Collection<any, any> {
		return this._cache;
	}

	_add(data: any, ...args: unknown[]): any {
		const cache = args[0];
		const options = args[1] as { id?: any; extras?: any[] } | undefined;

		const isCache = typeof cache === 'boolean' ? cache : true;
		const extraOptions = typeof cache === 'object' ? (cache as any) : (options ?? {});

		const existing = this.cache.get(extraOptions.id ?? data.id);
		if (existing) {
			if (isCache) {
				if (typeof (existing as any)._patch === 'function') (existing as any)._patch(data);
				return existing;
			}

			const clone = typeof (existing as any)._clone === 'function' ? (existing as any)._clone() : existing;
			if (typeof (clone as any)._patch === 'function') (clone as any)._patch(data);
			return clone;
		}

		const entry = this.holds ? new this.holds(this.client, data, ...(extraOptions.extras ?? [])) : data;
		if (isCache) this.cache.set(extraOptions.id ?? entry.id, entry);
		return entry;
	}
}
