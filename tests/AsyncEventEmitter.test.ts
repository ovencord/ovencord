import { describe, test, expect, beforeEach } from 'bun:test';
import { AsyncEventEmitter } from '../packages/discord.js/src/util/AsyncEventEmitter';

interface TestEvents {
  test: [number];
  async: [string];
  error: [Error];
  multiArg: [string, number, boolean];
}

describe('AsyncEventEmitter', () => {
  let emitter: AsyncEventEmitter<TestEvents>;

  beforeEach(() => {
    emitter = new AsyncEventEmitter<TestEvents>();
  });

  describe('Basic Functionality', () => {
    test('on() adds listener and emit() triggers it', async () => {
      let called = false;
      emitter.on('test', () => { called = true; });
      await emitter.emit('test', 42);
      expect(called).toBe(true);
    });

    test('multiple listeners receive same event', async () => {
      const results: number[] = [];
      emitter.on('test', (n) => results.push(n * 2));
      emitter.on('test', (n) => results.push(n * 3));
      
      await emitter.emit('test', 10);
      expect(results).toEqual([20, 30]);
    });

    test('emit returns false when no listeners', async () => {
      const result = await emitter.emit('test', 1);
      expect(result).toBe(false);
    });

    test('emit returns true when listeners exist', async () => {
      emitter.on('test', () => {});
      const result = await emitter.emit('test', 1);
      expect(result).toBe(true);
    });
  });

  describe('Sequential Execution', () => {
    test('listeners execute in order added', async () => {
      const order: number[] = [];
      
      emitter.on('test', async () => {
        await Bun.sleep(20);
        order.push(1);
      });
      
      emitter.on('test', async () => {
        await Bun.sleep(10);
        order.push(2);
      });
      
      emitter.on('test', () => {
        order.push(3);
      });

      await emitter.emit('test', 0);
      
      // CRITICO: Deve essere [1, 2, 3], non [3, 2, 1]
      expect(order).toEqual([1, 2, 3]);
    });

    test('later listeners see side effects of earlier ones', async () => {
      const state = { count: 0 };
      
      emitter.on('test', async () => {
        await Bun.sleep(5);
        state.count += 10;
      });
      
      emitter.on('test', () => {
        state.count *= 2;
      });

      await emitter.emit('test', 0);
      expect(state.count).toBe(20); // (0 + 10) * 2, non 10
    });
  });

  describe('once()', () => {
    test('listener fires only once', async () => {
      let count = 0;
      emitter.once('test', () => { count++; });

      await emitter.emit('test', 1);
      await emitter.emit('test', 2);
      await emitter.emit('test', 3);

      expect(count).toBe(1);
    });

    test('async once listener fires only once', async () => {
      let count = 0;
      emitter.once('test', async () => {
        await Bun.sleep(5);
        count++;
      });

      await emitter.emit('test', 1);
      await emitter.emit('test', 2);

      expect(count).toBe(1);
    });

    test('can remove once listener before it fires', () => {
      let called = false;
      const listener = () => { called = true; };
      
      emitter.once('test', listener);
      emitter.off('test', listener);

      expect(emitter.listenerCount('test')).toBe(0);
    });
  });

  describe('off()', () => {
    test('removes specific listener', async () => {
      const listener1 = () => {};
      const listener2 = () => {};

      emitter.on('test', listener1);
      emitter.on('test', listener2);
      emitter.off('test', listener1);

      expect(emitter.listenerCount('test')).toBe(1);
    });

    test('does not affect other events', () => {
      emitter.on('test', () => {});
      emitter.on('async', () => {});
      
      emitter.off('test', () => {});
      
      expect(emitter.listenerCount('async')).toBe(1);
    });

    test('removes once wrapper by original listener', async () => {
      let count = 0;
      const listener = () => { count++; };

      emitter.once('test', listener);
      emitter.off('test', listener); // Deve rimuovere il wrapper

      await emitter.emit('test', 1);
      expect(count).toBe(0);
    });
  });

  describe('removeAllListeners()', () => {
    test('removes all listeners for specific event', () => {
      emitter.on('test', () => {});
      emitter.on('test', () => {});
      emitter.on('async', () => {});

      emitter.removeAllListeners('test');

      expect(emitter.listenerCount('test')).toBe(0);
      expect(emitter.listenerCount('async')).toBe(1);
    });

    test('removes all listeners when no event specified', () => {
      emitter.on('test', () => {});
      emitter.on('async', () => {});

      emitter.removeAllListeners();

      expect(emitter.listenerCount('test')).toBe(0);
      expect(emitter.listenerCount('async')).toBe(0);
    });
  });

  describe('Error Handling', () => {
    test('error in listener emits error event if handler exists', async () => {
      let caughtError: Error | null = null;

      emitter.on('error', (err) => { caughtError = err; });
      emitter.on('test', () => { throw new Error('boom'); });

      await emitter.emit('test', 1);

      expect(caughtError).not.toBeNull();
      expect(caughtError?.message).toBe('boom');
    });

    test('error in listener throws if no error handler', async () => {
      emitter.on('test', () => { throw new Error('unhandled'); });

      await expect(emitter.emit('test', 1)).rejects.toThrow('unhandled');
    });

    test('error in error handler logs but does not crash', async () => {
      const logs: any[] = [];
      const originalError = console.error;
      console.error = (...args: any[]) => logs.push(args);

      emitter.on('error', () => { throw new Error('error handler failed'); });
      emitter.on('test', () => { throw new Error('original'); });

      // This should just log and resolve, not throw
      await emitter.emit('test', 1);

      console.error = originalError;
      expect(logs.length).toBeGreaterThan(0);
    });

    test('one failing listener does not stop others in sequential (if handled)', async () => {
       // WARNING: If we throw inside a listener and it bubbles up, the loop STOPS unless we catch inside the loop.
       // The implementation provided CATCHES inside the loop.
       // It either emits 'error' or throws.
       // If it throws (no error listener), the loop is interrupted.
       // If it emits 'error' (and that is handled), the loop continues? 
       // User requirement 2 says: "Discord.js emits 'error' se c'è un listener... if (event !== 'error')..."
       // It does NOT explicitly say "continue execution". 
       // Node.js EventEmitter traditionally STOPS on error.
       // However, `async emit` with `Promise.all` would run all but fail at the end (or reject fast).
       // Sequential loop: if one crashes, the rest do not run IF it throws.
       // BUT if we catch, emit 'error', and `await this.emit('error', ...)` resolves successfully, 
       // then the loop CAN continue. 
       // User Code: "await listener(...args)" inside try-catch.
       // Catch block delegates to 'error'.
       // After catch block, loop continues.
       // So yes, it should continue if error is "handled" (delegated to error listener).
       
      const results: number[] = [];

      emitter.on('error', () => {}); // Suppress error, so catch block finishes gracefully

      emitter.on('test', () => results.push(1));
      emitter.on('test', () => { throw new Error('fail'); });
      emitter.on('test', () => results.push(3));

      await emitter.emit('test', 0);

      expect(results).toEqual([1, 3]);
    });
  });

  describe('Memory Safety', () => {
    test('warns when exceeding maxListeners', () => {
      const warnings: any[] = [];
      const originalWarn = console.warn;
      console.warn = (...args: any[]) => warnings.push(args);

      for (let i = 0; i < 12; i++) {
        emitter.on('test', () => {});
      }

      console.warn = originalWarn;
      expect(warnings.length).toBeGreaterThan(0);
    });

    test('setMaxListeners changes limit', () => {
      emitter.setMaxListeners(20);
      
      const warnings: any[] = [];
      const originalWarn = console.warn;
      console.warn = (...args: any[]) => warnings.push(args);

      for (let i = 0; i < 15; i++) {
        emitter.on('test', () => {});
      }

      console.warn = originalWarn;
      expect(warnings.length).toBe(0);
    });
  });

  describe('Utility Methods', () => {
    test('listenerCount returns correct count', () => {
      expect(emitter.listenerCount('test')).toBe(0);
      
      emitter.on('test', () => {});
      expect(emitter.listenerCount('test')).toBe(1);
      
      emitter.on('test', () => {});
      expect(emitter.listenerCount('test')).toBe(2);
    });

    test('eventNames returns all registered events', () => {
      emitter.on('test', () => {});
      emitter.on('async', () => {});

      const names = emitter.eventNames();
      expect(names).toContain('test');
      expect(names).toContain('async');
      expect(names.length).toBe(2);
    });
  });

  describe('waitFor()', () => {
    test('resolves when event fires', async () => {
      setTimeout(() => emitter.emit('test', 42), 10);
      
      const [result] = await emitter.waitFor('test');
      expect(result).toBe(42);
    });

    test('rejects on timeout', async () => {
      await expect(
        emitter.waitFor('test', 50)
      ).rejects.toThrow('Timeout');
    });

    test('resolves before timeout', async () => {
      setTimeout(() => emitter.emit('test', 99), 10);
      
      const [result] = await emitter.waitFor('test', 100);
      expect(result).toBe(99);
    });
  });

  describe('Type Safety', () => {
    test('multiple arguments are preserved', async () => {
      let captured: [string, number, boolean] | null = null;

      emitter.on('multiArg', (s, n, b) => {
        captured = [s, n, b];
      });

      await emitter.emit('multiArg', 'test', 42, true);

      expect(captured).toEqual(['test', 42, true]);
    });
  });
});
