import { EventEmitter } from 'node:events';

export type EventMap = Record<string | symbol, any[]>;

/**
 * An EventEmitter that allows awaiting listeners.
 * @template Events The event map to use (key: event name, value: argument types array)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class AsyncEventEmitter<Events extends EventMap = EventMap> extends EventEmitter {
  /**
   * Synchronously calls each of the listeners registered for the event named `eventName`,
   * in the order they were registered, passing the supplied arguments to each.
   *
   * @param eventName The name of the event
   * @param args The arguments to pass to the listeners
   * @returns A promise that resolves to true if the event had listeners, false otherwise
   */
  // @ts-ignore: AsyncEventEmitter changes return type to Promise, overriding Node's boolean return
  public override async emit<K extends keyof Events>(eventName: K, ...args: Events[K]): Promise<boolean>;
  public override async emit(eventName: string | symbol, ...args: any[]): Promise<boolean> {
    const listeners = this.listeners(eventName);
    if (!listeners.length) return false;

    for (const listener of listeners) {
      await listener(...args);
    }

    return true;
  }
}
