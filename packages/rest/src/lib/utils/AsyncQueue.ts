/**
 * A simple asynchronous queue implementation
 */
export class AsyncQueue {
	#promises: Array<{ promise: Promise<void>; resolve: () => void }> = [];

	/**
	 * The remaining number of requests in the queue
	 */
	public get remaining(): number {
		return this.#promises.length;
	}

	/**
	 * Waits for the queue to be free
	 * @param options - Options for the wait
	 * @param options.signal - An optional abort signal
	 */
	public wait(options?: { signal?: AbortSignal }): Promise<void> {
		const next = this.#promises.length ? this.#promises.at(-1)!.promise : Promise.resolve();

		let resolve!: () => void;
		const promise = new Promise<void>((res) => {
			resolve = res;
		});

		this.#promises.push({ promise, resolve });

        // If no signal, just return the promise we wait on
        if (!options?.signal) {
            return next;
        }

        return new Promise((res, rej) => {
            if (options.signal!.aborted) {
                // Bridge immediately: when next resolves, we resolve our token
                next.then(() => resolve());
                rej(new Error('AbortError')); // TODO: Use DOMException or standard AbortError if available
                return;
            }

            const abortHandler = () => {
                // Bridge: when next resolves, we resolve our token
                next.then(() => resolve());
                rej(new Error('AbortError'));
            };

            options.signal!.addEventListener('abort', abortHandler, { once: true });

            next.then(() => {
                options.signal!.removeEventListener('abort', abortHandler);
                res();
            });
        });
	}

	/**
	 * Shifts the queue, allowing the next task to run
	 */
	public shift(): void {
		const item = this.#promises.shift();
		item?.resolve();
	}
}
