/* eslint-disable unicor */

import { DiscordjsRangeError, ErrorCodes  } from '../errors/index.js';

/**
 * Data structure that makes it easy to interact with a bitfield.
 */
export class BitField {
  /**
   * Numeric bitfield flags.
   */
  static Flags: Record<string, any> = {};

  /**
   * Default bit value.
   */
  static DefaultBit: number | bigint = 0;

  /**
   * Bitfield of the packed bits.
   */
  public bitfield: number | bigint;

  /**
   * @param {any} [bits] Bit(s) to read from
   */
  constructor(bits: any = (BitField as any).DefaultBit) {
    this.bitfield = (this.constructor as any).resolve(bits);
  }

  /**
   * Checks whether the bitfield has a bit, or any of multiple bits.
   *
   * @param {any} bit Bit(s) to check for
   * @returns {boolean}
   */
  any(bit: any): boolean {
    return ((this.bitfield as any) & (this.constructor as any).resolve(bit)) !== (this.constructor as any).DefaultBit;
  }

  /**
   * Checks if this bitfield equals another
   *
   * @param {any} bit Bit(s) to check for
   * @returns {boolean}
   */
  equals(bit: any): boolean {
    return this.bitfield === (this.constructor as any).resolve(bit);
  }

  /**
   * Checks whether the bitfield has a bit, or multiple bits.
   *
   * @param {any} bit Bit(s) to check for
   * @returns {boolean}
   */
  has(bit: any): boolean {
    const resolvedBit = (this.constructor as any).resolve(bit);
    return ((this.bitfield as any) & resolvedBit) === resolvedBit;
  }

  /**
   * Gets all given bits that are missing from the bitfield.
   *
   * @param {any} bits Bit(s) to check for
   * @param {...any} hasParams Additional parameters for the has method, if any
   * @returns {string[]}
   */
  missing(bits: any, ...hasParams: any[]): string[] {
    return (new (this.constructor as any)(bits)).remove(this).toArray(...hasParams);
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
  add(...bits: any[]): this {
    let total: any = (this.constructor as any).DefaultBit;
    for (const bit of bits) {
      total |= (this.constructor as any).resolve(bit);
    }

    if (Object.isFrozen(this)) return new (this.constructor as any)((this.bitfield as any) | total);
    (this.bitfield as any) |= total;
    return this;
  }

  /**
   * Removes bits from these.
   *
   * @param {...any} bits Bits to remove
   * @returns {BitField} These bits or new BitField if the instance is frozen.
   */
  remove(...bits: any[]): this {
    let total: any = (this.constructor as any).DefaultBit;
    for (const bit of bits) {
      total |= (this.constructor as any).resolve(bit);
    }

    if (Object.isFrozen(this)) return new (this.constructor as any)((this.bitfield as any) & ~total);
    (this.bitfield as any) &= ~total;
    return this;
  }

  /**
   * Gets an object mapping field names to a {@link boolean} indicating whether the
   * bit is available.
   *
   * @param {...any} hasParams Additional parameters for the has method, if any
   * @returns {Object}
   */
  serialize(...hasParams: any[]): Record<string, boolean> {
    const serialized: Record<string, boolean> = {};
    for (const [flag, bit] of Object.entries((this.constructor as any).Flags)) {
      if (isNaN(flag as any)) serialized[flag] = this.has(bit);
    }

    return serialized;
  }

  /**
   * Gets an {@link Array} of bitfield names based on the bits available.
   *
   * @param {...any} hasParams Additional parameters for the has method, if any
   * @returns {string[]}
   */
  toArray(...hasParams: any[]): string[] {
    return [...this[Symbol.iterator](...hasParams)];
  }

  toJSON(): string | number {
    return typeof this.bitfield === 'number' ? this.bitfield : this.bitfield.toString();
  }

  valueOf(): number | bigint {
    return this.bitfield;
  }

  *[Symbol.iterator](...hasParams: any[]): Generator<string> {
    for (const bitName of Object.keys((this.constructor as any).Flags)) {
      if (isNaN(bitName as any) && this.has(bitName)) yield bitName;
    }
  }

  /**
   * Resolves bitfields to their numeric form.
   *
   * @param {any} [bit] bit(s) to resolve
   * @returns {number|bigint}
   */
  static resolve(bit: any): number | bigint {
    const { DefaultBit } = this;
    if (typeof DefaultBit === typeof bit && bit >= DefaultBit) return bit;
    if (bit instanceof BitField) return bit.bitfield;
    if (Array.isArray(bit)) {
      return bit.map(bit_ => this.resolve(bit_)).reduce((prev, bit_) => (prev as any) | (bit_ as any), DefaultBit);
    }

    if (typeof bit === 'string') {
      if (!isNaN(bit as any)) return typeof DefaultBit === 'bigint' ? BigInt(bit) : Number(bit);
      if (this.Flags[bit] !== undefined) return this.Flags[bit];
    }

    throw new DiscordjsRangeError(ErrorCodes.BitFieldInvalid, bit);
  }
}

