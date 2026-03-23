import { DiscordjsRangeError, ErrorCodes } from '../errors/index.js';

/**
 * Data that can be resolved into a bitfield.
 */
export type BitFieldResolvable = number | bigint | string | BitField | BitFieldResolvable[];

/**
 * Data structure that makes it easy to interact with a bitfield.
 */
export class BitField {
	/**
	 * Numeric bitfield flags.
	 */
	static Flags: Record<string, number | bigint> = {};

	/**
	 * Default bit value.
	 */
	static DefaultBit: number | bigint = 0;

	/**
	 * Bitfield of the packed bits.
	 */
	public bitfield: number | bigint;

	/**
	 * @param {BitFieldResolvable} [bits] Bit(s) to read from
	 */
	constructor(bits: BitFieldResolvable = (BitField as typeof BitField).DefaultBit as BitFieldResolvable) {
		this.bitfield = (this.constructor as typeof BitField).resolve(bits);
	}

	/**
	 * Checks whether the bitfield has a bit, or any of multiple bits.
	 *
	 * @param {any} bit Bit(s) to check for
	 * @returns {boolean}
	 */
	any(bit: BitFieldResolvable): boolean {
		return (
			// LAST RESORT: bitwise operators do not support union of number | bigint directly
			((this.bitfield as unknown as number) &
				((this.constructor as typeof BitField).resolve(bit) as unknown as number)) !==
			((this.constructor as typeof BitField).DefaultBit as unknown as number)
		);
	}

	/**
	 * Checks if this bitfield equals another
	 *
	 * @param {any} bit Bit(s) to check for
	 * @returns {boolean}
	 */
	equals(bit: BitFieldResolvable): boolean {
		return this.bitfield === (this.constructor as typeof BitField).resolve(bit);
	}

	/**
	 * Checks whether the bitfield has a bit, or multiple bits.
	 *
	 * @param {any} bit Bit(s) to check for
	 * @returns {boolean}
	 */
	has(bit: BitFieldResolvable): boolean {
		const resolvedBit = (this.constructor as typeof BitField).resolve(bit);
		// LAST RESORT: bitwise operators do not support union of number | bigint directly
		return (
			((this.bitfield as unknown as number) & (resolvedBit as unknown as number)) === (resolvedBit as unknown as number)
		);
	}

	/**
	 * Gets all given bits that are missing from the bitfield.
	 *
	 * @param {any} bits Bit(s) to check for
	 * @param {...any} hasParams Additional parameters for the has method, if any
	 * @returns {string[]}
	 */
	missing(bits: BitFieldResolvable, ...hasParams: readonly any[]): string[] {
		return new (this.constructor as typeof BitField)(bits).remove(this).toArray(...hasParams);
	}

	/**
	 * Freezes these bits, making them immutable.
	 *
	 * @returns {Readonly<BitField>}
	 */
	freeze(): Readonly<this> {
		return Object.freeze(this);
	}

	/**
	 * Adds bits to these ones.
	 *
	 * @param {...any} bits Bits to add
	 * @returns {BitField} These bits or new BitField if the instance is frozen.
	 */
	add(...bits: BitFieldResolvable[]): this {
		let total = (this.constructor as typeof BitField).DefaultBit;
		for (const bit of bits) {
			// LAST RESORT: bitwise operators do not support union of number | bigint directly
			(total as unknown as number) |= (this.constructor as typeof BitField).resolve(bit) as unknown as number;
		}

		if (Object.isFrozen(this))
			return new (this.constructor as typeof BitField)(
				(this.bitfield as unknown as number) | (total as unknown as number),
			) as this;
		(this.bitfield as unknown as number) |= total as unknown as number;
		return this;
	}

	/**
	 * Removes bits from these.
	 *
	 * @param {...any} bits Bits to remove
	 * @returns {BitField} These bits or new BitField if the instance is frozen.
	 */
	remove(...bits: BitFieldResolvable[]): this {
		let total = (this.constructor as typeof BitField).DefaultBit;
		for (const bit of bits) {
			// LAST RESORT: bitwise operators do not support union of number | bigint directly
			(total as unknown as number) |= (this.constructor as typeof BitField).resolve(bit) as unknown as number;
		}

		if (Object.isFrozen(this))
			return new (this.constructor as typeof BitField)(
				(this.bitfield as unknown as number) & ~(total as unknown as number),
			) as this;
		(this.bitfield as unknown as number) &= ~(total as unknown as number);
		return this;
	}

	/**
	 * Gets an object mapping field names to a {@link boolean} indicating whether the
	 * bit is available.
	 *
	 * @param {...any} hasParams Additional parameters for the has method, if any
	 * @returns {Object}
	 */
	serialize(..._hasParams: readonly any[]): Record<string, boolean> {
		const serialized: Record<string, boolean> = {};
		for (const [flag, bit] of Object.entries((this.constructor as typeof BitField).Flags)) {
			if (Number.isNaN(Number(flag))) serialized[flag] = this.has(bit as BitFieldResolvable);
		}

		return serialized;
	}

	/**
	 * Gets an {@link Array} of bitfield names based on the bits available.
	 *
	 * @param {...any} hasParams Additional parameters for the has method, if any
	 * @returns {string[]}
	 */
	toArray(...hasParams: readonly any[]): string[] {
		return [...this[Symbol.iterator](...hasParams)];
	}

	toJSON(): string | number {
		return typeof this.bitfield === 'number' ? this.bitfield : this.bitfield.toString();
	}

	valueOf(): number | bigint {
		return this.bitfield;
	}

	*[Symbol.iterator](..._hasParams: readonly any[]): Generator<string> {
		for (const bitName of Object.keys((this.constructor as typeof BitField).Flags)) {
			if (Number.isNaN(Number(bitName)) && this.has(bitName as BitFieldResolvable)) yield bitName;
		}
	}

	/**
	 * Resolves bitfields to their numeric form.
	 *
	 * @param {any} [bit] bit(s) to resolve
	 * @returns {number|bigint}
	 */
	static resolve(bit: BitFieldResolvable): number | bigint {
		const { DefaultBit } = BitField as typeof BitField;
		if (typeof bit === 'number' || typeof bit === 'bigint') {
			if (bit >= (typeof bit === 'bigint' ? 0n : 0)) {
				return typeof DefaultBit === 'bigint' ? BigInt(bit) : Number(bit);
			}
		}
		if (bit instanceof BitField) return bit.bitfield;
		if (Array.isArray(bit)) {
			return (
				bit
					.map((bit_) => (BitField as typeof BitField).resolve(bit_))
					// LAST RESORT: bitwise operators do not support union of number | bigint directly
					.reduce(
						(prev, bit_) => (prev as unknown as number) | (bit_ as unknown as number),
						DefaultBit as unknown as number,
					) as number | bigint
			);
		}

		if (typeof bit === 'string') {
			if (!Number.isNaN(Number(bit))) return typeof DefaultBit === 'bigint' ? BigInt(bit) : Number(bit);
			if ((BitField as typeof BitField).Flags[bit] !== undefined) return (BitField as typeof BitField).Flags[bit];
		}

		throw new DiscordjsRangeError(ErrorCodes.BitFieldInvalid, bit);
	}
}
