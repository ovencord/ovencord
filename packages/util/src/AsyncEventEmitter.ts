import { AsyncQueue } from './AsyncQueue.js';

export type EventMap = Record<string | symbol, any[]>;

export class AsyncEventEmitter<Events extends Record<keyof Events, any[]> = any> {
  private _listeners = new Map<keyof Events | string | symbol, Set<Function>>();
  private _maxListeners = 10;

  public on<K extends keyof Events>(event: K, listener: (...args: Events[K]) => void | Promise<void>): this;
  public on<K extends string | symbol>(event: K, listener: (...args: any[]) => void | Promise<void>): this;
  public on(event: string | symbol, listener: Function): this {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }

    const listeners = this._listeners.get(event)!;
    listeners.add(listener);

    if (listeners.size > this._maxListeners) {
      console.warn(
        `Possible AsyncEventEmitter memory leak detected. ` +
        `${listeners.size} ${String(event)} listeners added. ` +
        `Use emitter.setMaxListeners() to increase limit`
      );
    }

    return this;
  }

  public addListener<K extends keyof Events>(event: K, listener: (...args: Events[K]) => void | Promise<void>): this;
  public addListener<K extends string | symbol>(event: K, listener: (...args: any[]) => void | Promise<void>): this;
  public addListener(event: string | symbol, listener: Function): this {
    return this.on(event, listener as any);
  }

  public once<K extends keyof Events>(event: K, listener: (...args: Events[K]) => void | Promise<void>): this;
  public once<K extends string | symbol>(event: K, listener: (...args: any[]) => void | Promise<void>): this;
  public once(event: string | symbol, listener: Function): this {
    const wrapper = async (...args: any[]) => {
      this.off(event, wrapper);
      await listener(...args);
    };

    Object.defineProperty(wrapper, '_originalListener', {
      value: listener,
      writable: false,
      enumerable: false,
    });

    return this.on(event, wrapper);
  }

  public off<K extends keyof Events>(event: K, listener: (...args: Events[K]) => void | Promise<void>): this;
  public off<K extends string | symbol>(event: K, listener: (...args: any[]) => void | Promise<void>): this;
  public off(event: string | symbol, listener: Function): this {
    const listeners = this._listeners.get(event);
    if (!listeners) return this;

    for (const fn of listeners) {
      if (fn === listener || (fn as any)._originalListener === listener) {
        listeners.delete(fn);
      }
    }

    if (listeners.size === 0) {
      this._listeners.delete(event);
    }

    return this;
  }

  public removeListener<K extends keyof Events>(event: K, listener: (...args: Events[K]) => void | Promise<void>): this;
  public removeListener<K extends string | symbol>(event: K, listener: (...args: any[]) => void | Promise<void>): this;
  public removeListener(event: string | symbol, listener: Function): this {
    return this.off(event, listener as any);
  }

  public async emit<K extends keyof Events>(event: K, ...args: Events[K]): Promise<boolean>;
  public async emit<K extends string | symbol>(event: K, ...args: any[]): Promise<boolean>;
  public async emit(event: string | symbol, ...args: any[]): Promise<boolean> {
    const listeners = this._listeners.get(event);
    if (!listeners?.size) return false;

    // We copy the listeners to ensure that if a listener is removed during execution,
    // the loop still iterates over the snapshot of listeners at the time of emission.
    // However, for strict sequential execution where one might remove another,
    // iterating over the live Set or a copy is a design choice.
    // Discord.js usually handles this by copying or iterating safe.
    // The user's snippet iterates directly over the listeners collection from .get().
    // If we use 'for of' on a Set, it handles deletions gracefully (the deleted item won't be visited if not reached yet),
    // but additions might be visited.
    // For now, adhering to user's "for (const listener of listeners)" pattern.
    
    // NOTE: Iterating over the Set directly allows listeners to remove themselves safely.
    for (const listener of listeners) {
      try {
        await listener(...args);
      } catch (error) {
        if (event === 'error') {
          console.error('Error in error handler:', error);
        } else if (this.listenerCount('error') > 0) {
          await this.emit('error', error);
        } else {
          console.error(`Unhandled error in ${String(event)} event:`, error);
          throw error;
        }
      }
    }

    return true;
  }

  public removeAllListeners(event?: keyof Events | string | symbol): this {
    if (event !== undefined) {
      this._listeners.delete(event);
    } else {
      this._listeners.clear();
    }
    return this;
  }

  public setMaxListeners(n: number): this {
    this._maxListeners = n;
    return this;
  }

  public getMaxListeners(): number {
    return this._maxListeners;
  }

  public listenerCount(event: keyof Events | string | symbol): number {
    return this._listeners.get(event)?.size ?? 0;
  }

  public eventNames(): Array<keyof Events | string | symbol> {
    return Array.from(this._listeners.keys());
  }

  public rawListeners(event: keyof Events | string | symbol): Function[] {
    return Array.from(this._listeners.get(event) ?? []);
  }

  public waitFor<K extends keyof Events>(event: K, timeout?: number): Promise<Events[K]>;
  public waitFor(event: string | symbol, timeout?: number): Promise<any[]> {
    return new Promise((resolve, reject) => {
      let timeoutId: Timer | undefined;

      const listener = (...args: any[]) => {
        if (timeoutId) clearTimeout(timeoutId);
        resolve(args);
      };

      this.once(event, listener);

      if (timeout) {
        timeoutId = setTimeout(() => {
          this.off(event, listener);
          reject(new Error(`Timeout waiting for ${String(event)}`));
        }, timeout);
      }
    });
  }

  public static async *on<T extends AsyncEventEmitter<any>, K extends keyof (T extends AsyncEventEmitter<infer U> ? U : never)>(
    emitter: T,
    eventName: K,
    options?: { signal?: AbortSignal }
  ): AsyncIterableIterator<(T extends AsyncEventEmitter<infer U> ? U : never)[K]> {
    const signal = options?.signal;
    if (signal?.aborted) throw new Error('AbortError');

    const queue = new AsyncQueue();
    const items: any[][] = [];

    const listener = (...args: any[]) => {
      items.push(args);
      queue.shift();
    };

    const abortHandler = () => {
      emitter.off(eventName as any, listener);
      queue.shift();
    };

    emitter.on(eventName as any, listener);
    signal?.addEventListener('abort', abortHandler, { once: true });

    try {
      while (true) {
        if (signal?.aborted && items.length === 0) break;
        if (items.length === 0) {
          await queue.wait(options);
        }
        if (signal?.aborted && items.length === 0) break;

        yield items.shift()! as any;
      }
    } finally {
      emitter.off(eventName as any, listener);
      signal?.removeEventListener('abort', abortHandler);
    }
  }
}
