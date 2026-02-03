
import { DiscordjsError, ErrorCodes  } from '../errors/index.js';
import { BaseManager  } from './BaseManager.js';

/**
 * Manages the API methods of a data model along with a collection of instances.
 *
 * @extends {BaseManager}
 * @abstract
 */
export abstract class DataManager extends BaseManager {
  public holds: any;

  constructor(client: any, holds: any) {
    super(client);
    this.holds = holds;
  }

  get cache(): any {
    throw new DiscordjsError(ErrorCodes.NotImplemented, 'get cache', this.constructor.name);
  }

  resolve(idOrInstance: any): any {
    if (idOrInstance instanceof this.holds) return idOrInstance;
    if (typeof idOrInstance === 'string') return this.cache.get(idOrInstance) ?? null;
    return null;
  }

  resolveId(idOrInstance: any): any {
    if (idOrInstance instanceof this.holds) return (idOrInstance as any).id;
    if (typeof idOrInstance === 'string') return idOrInstance;
    return null;
  }

  override valueOf(): any {
    return this.cache;
  }
}
