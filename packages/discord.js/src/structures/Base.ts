import type { Client } from '../client/Client.js';
import { flatten } from '../util/Util.js';

/**
 * Represents a data model that is identifiable by a Snowflake (i.e. Discord API data models).
 *
 * @abstract
 */
export abstract class Base {
	public client: Client;

	constructor(client: Client) {
		// Non-enumerable so flatten()/Object.keys() won't recurse into the massive Client object
		Object.defineProperty(this, 'client', { value: client, writable: true, enumerable: false });
	}

	_clone(): this {
		return Object.assign(Object.create(this), this);
	}

	_patch(_data: unknown): unknown {
		return _data;
	}

	_update(data: unknown): this {
		const clone = this._clone();
		this._patch(data);
		return clone;
	}

	toJSON(...props: Record<string, boolean | string>[]): Record<string, unknown> {
		return flatten(this, ...props);
	}

	valueOf(): string {
		return (this as unknown as { id: string }).id;
	}
}
