import { EventEmitter } from 'node:events';

/**
 * An EventEmitter that allows awaiting listeners.
 */
export class AsyncEventEmitter extends EventEmitter {
  /**
   * Synchronously calls each of the listeners registered for the event named `eventName`,
   * in the order they were registered, passing the supplied arguments to each.
   *
   * @param {string | symbol} eventName The name of the event
   * @param {...any} args The arguments to pass to the listeners
   * @returns {Promise<boolean>}
   */
  // @ts-ignore: AsyncEventEmitter changes return type to Promise
  public override async emit(eventName: string | symbol, ...args: any[]): Promise<boolean> {
    const listeners = this.listeners(eventName);
    if (!listeners.length) return false;

    for (const listener of listeners) {
      await listener(...args);
    }

    return true;
  }
}
