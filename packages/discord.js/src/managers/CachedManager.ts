
import { MakeCacheOverrideSymbol  } from '../util/Symbols.js';
import { DataManager  } from './DataManager.js';

/**
 * Manages the API methods of a data model with a mutable cache of instances.
 *
 * @extends {DataManager}
 * @abstract
 */
export abstract class CachedManager extends DataManager {
  public _cache: any;
  public holds: any;

  constructor(client: any, holds: any, iterable?: any) {
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

  override get cache(): any {
    return this._cache;
  }

  _add(data, cache = true, { id, extras = [] as any[] }: { id?: string; extras?: any[] }: any = {}: any) {
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
