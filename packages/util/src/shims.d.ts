/**
 * Type Shims for Bun Native Environment
 * 
 * This file provides type declarations to eliminate conflicts between
 * @types/node and @types/bun, allowing clean TypeScript compilation
 * in a pure Bun environment.
 */

declare global {
	/**
	 * Minimal NodeJS namespace declarations for compatibility with libraries
	 * that reference Node.js types but run in Bun runtime.
	 */
	namespace NodeJS {
		/**
		 * TypedArray union type - maps to Web Standard TypedArrays
		 */
		type TypedArray =
			| Uint8Array
			| Uint8ClampedArray
			| Uint16Array
			| Uint32Array
			| Int8Array
			| Int16Array
			| Int32Array
			| Float32Array
			| Float64Array
			| BigUint64Array
			| BigInt64Array;

		/**
		 * Error with errno code - compatible with Bun's error handling
		 */
		interface ErrnoException extends Error {
			errno?: number | undefined;
			code?: string | undefined;
			path?: string | undefined;
			syscall?: string | undefined;
		}

		/**
		 * Process CWD function - maps to Bun.cwd()
		 */
		interface Process {
			cwd(): string;
			env: Record<string, string | undefined>;
			platform: string;
		}

		interface Timeout extends Number {}
	}
	
	// Global declarations
	var process: NodeJS.Process;
	var __dirname: string;
	var __filename: string;
}

export {};
