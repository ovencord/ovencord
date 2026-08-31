import type { Collection } from '@ovencord/collection';
import type { Snowflake } from 'discord-api-types/v10';
import type { Client } from '../client/Client.js';
import { MakeCacheOverrideSymbol } from '../util/Symbols.js';
import { DataManager } from './DataManager.js';

/**
 * Manages the API methods of a data model with a mutable cache of instances.
 *
 * @extends {DataManager}
 * @abstract
 */
export abstract class CachedManager<K extends Snowflake | string = Snowflake, Holds = any, R = any> extends DataManager<
	K,
	Holds,
	R
> {
	public _cache!: Collection<K, Holds>;
	// biome-ignore lint/suspicious/noExplicitAny: holds class reference
	public override holds: any;

	// biome-ignore lint/suspicious/noExplicitAny: constructor holds and iterable
	constructor(client: Client, holds: any, iterable?: Iterable<any>) {
		super(client, holds);

		this.holds = holds;

		Object.defineProperty(this, '_cache', {
			value: (this.client as any).options.makeCache({
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

	// biome-ignore lint/suspicious/noExplicitAny: internal cache hydration
	_add(data: any, cache = true, { id, extras = [] }: any = {}): Holds {
		const existing = (this.cache as any).get(id ?? data.id);
		if (existing) {
			if (cache) {
				if (typeof existing._patch === 'function') existing._patch(data);
				return existing;
			}

			const clone = typeof existing._clone === 'function' ? existing._clone() : existing;
			if (typeof clone._patch === 'function') clone._patch(data);
			return clone;
		}

		const entry = this.holds ? new this.holds(this.client, data, ...extras) : data;
		if (cache) (this.cache as any).set(id ?? entry.id, entry);
		return entry;
	}
}
