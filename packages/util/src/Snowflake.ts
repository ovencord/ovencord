/**
 * Options for {@link Snowflake.generate}
 */
export interface SnowflakeGenerateOptions {
	/**
	 * Timestamp or date of the snowflake to generate
	 * @default Date.now()
	 */
	timestamp?: number | bigint | Date;

	/**
	 * The increment to use
	 * @default 0n
	 * @remark keep in mind that this bigint is auto-incremented between generate calls
	 */
	increment?: bigint;

	/**
	 * The worker ID to use, will be truncated to 5 bits (0-31)
	 * @default 0n
	 */
	workerId?: bigint;

	/**
	 * The process ID to use, will be truncated to 5 bits (0-31)
	 * @default 1n
	 */
	processId?: bigint;
}

/**
 * Object returned by {@link Snowflake.deconstruct}
 */
export interface DeconstructedSnowflake {
	/** The id in BigInt form */
	id: bigint;
	/** The timestamp stored in the snowflake */
	timestamp: bigint;
	/** The worker id stored in the snowflake */
	workerId: bigint;
	/** The process id stored in the snowflake */
	processId: bigint;
	/** The increment stored in the snowflake */
	increment: bigint;
	/** The epoch to use in the snowflake */
	epoch: bigint;
}

const MaximumWorkerId = 0b11111n;
const MaximumProcessId = 0b11111n;
const MaximumIncrement = 0b111111111111n;
const TimestampFieldDivisor = 2 ** 22;

/**
 * A class for generating and deconstructing snowflakes.
 *
 * A snowflake is a 64-bit unsigned integer with 4 fields that have a fixed epoch value.
 *
 * ```
 * 64                                          22     17     12          0
 *  000000111011000111100001101001000101000000  00001  00000  000000000000
 *           number of ms since epoch           worker  pid    increment
 * ```
 */
export class Snowflake {
	/** Alias for {@link deconstruct} */
	public readonly decode = this.deconstruct.bind(this);

	#epoch: bigint;
	#epochNumber: number;
	#increment = 0n;
	#processId = 1n;
	#workerId = 0n;

	/**
	 * @param epoch the epoch to use
	 */
	constructor(epoch: number | bigint | Date) {
		this.#epoch = BigInt(epoch instanceof Date ? epoch.getTime() : epoch);
		this.#epochNumber = Number(this.#epoch);
	}

	/** The epoch for this snowflake, as a bigint */
	get epoch(): bigint {
		return this.#epoch;
	}

	/** The epoch for this snowflake, as a number */
	get epochNumber(): number {
		return this.#epochNumber;
	}

	/** Gets the configured process ID */
	get processId(): bigint {
		return this.#processId;
	}

	/** Sets the process ID (masked with `0b11111n`) */
	set processId(value: number | bigint) {
		this.#processId = BigInt(value) & MaximumProcessId;
	}

	/** Gets the configured worker ID */
	get workerId(): bigint {
		return this.#workerId;
	}

	/** Sets the worker ID (masked with `0b11111n`) */
	set workerId(value: number | bigint) {
		this.#workerId = BigInt(value) & MaximumWorkerId;
	}

	/**
	 * Generates a snowflake given an epoch and optionally a timestamp.
	 *
	 * @param options - Options to pass into the generator
	 * @returns A unique snowflake
	 */
	generate({
		increment,
		timestamp = Date.now(),
		workerId = this.#workerId,
		processId = this.#processId,
	}: SnowflakeGenerateOptions = {}): bigint {
		if (timestamp instanceof Date) timestamp = BigInt(timestamp.getTime());
		else if (typeof timestamp === 'number') timestamp = BigInt(timestamp);
		else if (typeof timestamp !== 'bigint') {
			throw new TypeError(`"timestamp" argument must be a number, bigint, or Date (received ${typeof timestamp})`);
		}

		if (typeof increment !== 'bigint') {
			increment = this.#increment;
			this.#increment = (increment + 1n) & MaximumIncrement;
		}

		return (
			((timestamp - this.#epoch) << 22n) |
			((workerId & MaximumWorkerId) << 17n) |
			((processId & MaximumProcessId) << 12n) |
			(increment & MaximumIncrement)
		);
	}

	/**
	 * Deconstructs a snowflake given a snowflake ID.
	 *
	 * @param id - The snowflake to deconstruct
	 * @returns A deconstructed snowflake
	 */
	deconstruct(id: string | bigint): DeconstructedSnowflake {
		const bigIntId = BigInt(id);
		const epoch = this.#epoch;
		return {
			id: bigIntId,
			timestamp: (bigIntId >> 22n) + epoch,
			workerId: (bigIntId >> 17n) & MaximumWorkerId,
			processId: (bigIntId >> 12n) & MaximumProcessId,
			increment: bigIntId & MaximumIncrement,
			epoch,
		};
	}

	/**
	 * Retrieves the timestamp field's value from a snowflake.
	 *
	 * @param id - The snowflake to get the timestamp value from
	 * @returns The UNIX timestamp that is stored in `id`
	 */
	timestampFrom(id: string | bigint): number {
		return Math.floor(Number(id) / TimestampFieldDivisor) + this.#epochNumber;
	}

	/**
	 * Compares two snowflakes.
	 *
	 * @param a - The first snowflake to compare
	 * @param b - The second snowflake to compare
	 * @returns `-1` if `a` is older than `b`, `0` if equal, `1` if `a` is newer than `b`
	 */
	static compare(a: string | bigint, b: string | bigint): -1 | 0 | 1 {
		const typeA = typeof a;
		if (typeA === typeof b) {
			if (typeA === 'string') {
				return a === b ? 0 : (a as string).length < (b as string).length ? -1 : (a as string).length > (b as string).length ? 1 : a < b ? -1 : 1;
			}

			return a === b ? 0 : (a as bigint) < (b as bigint) ? -1 : 1;
		}

		const bigA = BigInt(a);
		const bigB = BigInt(b);
		return bigA === bigB ? 0 : bigA < bigB ? -1 : 1;
	}
}

/**
 * A {@link Snowflake} instance using Discord's epoch (2015-01-01T00:00:00.000Z).
 *
 * @see {@link https://discord.com/developers/docs/reference#snowflakes}
 */
export const DiscordSnowflake = new Snowflake(1420070400000n);
