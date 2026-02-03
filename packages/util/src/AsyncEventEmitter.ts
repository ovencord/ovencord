import { EventEmitter } from 'node:events';

/**
 * A typed EventEmitter shim to replace @vladfrangu/async_event_emitter
 * This version uses the native node:events EventEmitter.
 * Note: strict async emission (awaiting listeners) is not implemented as it was not used by the library internally.
 */
export class AsyncEventEmitter<TEvents extends { [K in keyof TEvents]: any[] }> extends EventEmitter {
	public on<K extends keyof TEvents & string>(event: K, listener: (...args: TEvents[K]) => void): this {
		return super.on(event, listener as any);
	}

	public once<K extends keyof TEvents & string>(event: K, listener: (...args: TEvents[K]) => void): this {
		return super.once(event, listener as any);
	}

	public emit<K extends keyof TEvents & string>(event: K, ...args: TEvents[K]): boolean {
		return super.emit(event, ...args);
	}

	public off<K extends keyof TEvents & string>(event: K, listener: (...args: TEvents[K]) => void): this {
		return super.off(event, listener as any);
	}

    public removeListener<K extends keyof TEvents & string>(event: K, listener: (...args: TEvents[K]) => void): this {
        return super.removeListener(event, listener as any);
    }
}
