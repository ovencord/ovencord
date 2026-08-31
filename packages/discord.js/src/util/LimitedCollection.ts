import { Collection } from '@ovencord/collection';
import { DiscordjsTypeError, ErrorCodes } from '../errors/index.js';

/**
 * Options for defining the behavior of a LimitedCollection
 */
export interface LimitedCollectionOptions<K, V> {
	maxSize?: number | null;
	keepOverLimit?: ((value: V, key: K, collection: LimitedCollection<K, V>) => boolean) | null;
}

/**
 * A Collection which holds a max amount of entries.
 *
 * @extends {Collection}
 */
export class LimitedCollection<K, V> extends Collection<K, V> {
	public maxSize: number;
	public keepOverLimit: ((value: V, key: K, collection: LimitedCollection<K, V>) => boolean) | null;

	constructor(options: LimitedCollectionOptions<K, V> = {}, iterable?: Iterable<readonly [K, V]> | null) {
		if (typeof options !== 'object' || options === null) {
			throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'options', 'object', true);
		}

		const { maxSize = Infinity, keepOverLimit = null } = options;

		if (typeof maxSize !== 'number') {
			throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'maxSize', 'number');
		}

		if (keepOverLimit !== null && typeof keepOverLimit !== 'function') {
			throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'keepOverLimit', 'function');
		}

		super(iterable ?? undefined);

		/**
		 * The max size of the Collection.
		 *
		 * @type {number}
		 */
		this.maxSize = maxSize;

		/**
		 * A function called to check if an entry should be kept when the Collection is at max size.
		 *
		 * @type {?Function}
		 */
		this.keepOverLimit = keepOverLimit;
	}

	override set(key: K, value: V): this {
		if (this.maxSize === 0 && !this.keepOverLimit?.(value, key, this)) return this;
		if (this.size >= this.maxSize && !this.has(key)) {
			for (const [iteratedKey, iteratedValue] of this.entries()) {
				const keep = this.keepOverLimit?.(iteratedValue, iteratedKey, this) ?? false;
				if (!keep) {
					this.delete(iteratedKey);
					break;
				}
			}
		}

		return super.set(key, value);
	}

	static override get [Symbol.species]() {
		return Collection;
	}
}
