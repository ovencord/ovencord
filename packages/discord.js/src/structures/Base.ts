
import { flatten  } from '../util/Util.js';

/**
 * Represents a data model that is identifiable by a Snowflake (i.e. Discord API data models).
 *
 * @abstract
 */
export abstract class Base {
  public client: any;

  constructor(client: any) {
    // Non-enumerable so flatten()/Object.keys() won't recurse into the massive Client object
    Object.defineProperty(this, 'client', { value: client, writable: true, enumerable: false });
  }

  _clone(): any {
    return Object.assign(Object.create(this), this);
  }

  _patch(data: any): any {
    return data;
  }

  _update(data: any): any {
    const clone = this._clone();
    this._patch(data);
    return clone;
  }

  toJSON(...props: any[]): any {
    return flatten(this, ...props);
  }

  valueOf(): any {
    return (this as any).id;
  }
}
