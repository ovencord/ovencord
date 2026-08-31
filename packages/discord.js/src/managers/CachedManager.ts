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
export abstract class CachedManager<K = any, Holds = any, R = any> extends DataManager<K, Holds, R> {
	public _cache: Collection<K, Holds>;
	public override holds: any;

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

	override get cache(): Collection<K, Holds> {
		return this._cache;
	}

	_add(data: any, ...args: unknown[]): Holds {
		const cache = args[0];
		const options = args[1] as { id?: any; extras?: any[] } | undefined;

		const isCache = typeof cache === 'boolean' ? cache : true;
		const extraOptions = typeof cache === 'object' ? (cache as any) : (options ?? {});

		let id: any;
		if (extraOptions.id) {
			id = extraOptions.id;
		} else if (data && typeof data === 'object') {
			id = data.id ?? data;
		} else {
			id = data;
		}

		let existing = this._cache?.get(id);

		if (existing && !(args[0] === false || (extraOptions && extraOptions.cache === false))) {
			if (typeof existing._patch === 'function') {
				existing._patch(data);
			}
			return existing;
		}

		const entry = this.holds ? new this.holds(this.client, data, ...(extraOptions.extras ?? [])) : data;

		if (isCache && this._cache && id) {
			this._cache.set(id, entry);
		}

		return entry;
	}
}
