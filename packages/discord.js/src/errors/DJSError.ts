// Heavily inspired by node's `internal/errors` module
import { ErrorCodes } from './ErrorCodes.js';
import { Messages } from './Messages.js';

/**
 * Extend an error of some sort into a DiscordjsError.
 *
 * @param {Error} Base Base error to extend
 * @returns {DiscordjsError}
 * @ignore
 */
export function makeDiscordjsError(Base: typeof Error) {
	return class extends Base {
		public code: keyof typeof ErrorCodes;
		static {
			Object.defineProperty(this, 'name', { value: `Discordjs${Base.name}` });
		}

		constructor(code: keyof typeof ErrorCodes, ...args: unknown[]) {
			super(message(code, args));
			this.code = code;
			Error.captureStackTrace(this, this.constructor);
		}

		override get name() {
			return `${this.constructor.name} [${this.code}]`;
		}
	};
}

/**
 * Format the message for an error.
 *
 * @param {string} code The error code
 * @param {Array<*>} args Arguments to pass for util format or as function args
 * @returns {string} Formatted string
 * @ignore
 */
export function message(code: keyof typeof ErrorCodes, args: unknown[]) {
	if (!(code in ErrorCodes)) throw new Error('Error code must be a valid DiscordjsErrorCodes');
	const msg = Messages[code];
	if (!msg) throw new Error(`No message associated with error code: ${code}.`);
	if (typeof msg === 'function') return (msg as (...args: unknown[]) => string)(...args);
	if (!args?.length) return msg;
	(args as unknown[]).unshift(msg);
	return String(...(args as unknown[]));
}

export const DiscordjsError = makeDiscordjsError(Error);
export const DiscordjsTypeError = makeDiscordjsError(TypeError);
export const DiscordjsRangeError = makeDiscordjsError(RangeError);
