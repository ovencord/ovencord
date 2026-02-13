/* eslint-disable   */
import { calculateShardId } from '@ovencord/util';
import { WebSocketShardEvents } from '@ovencord/ws';
import { DiscordjsError, DiscordjsTypeError, ErrorCodes } from '../errors/index.js';
import { Events } from '../util/Events.js';
import { makeError, makePlainError } from '../util/Util.js';

// Declare self for worker thread context
declare var self: Worker;

/**
 * Helper class for sharded clients spawned as a child process/worker, such as from a {@link ShardingManager}.
 * Utilizes IPC to send and receive data to/from the master process and other shards.
 */
export class ShardClientUtil {
  public client: any;
  public mode: any;

  private static _singleton: ShardClientUtil | null = null;
  
  constructor(client: any, mode: any) {
    /**
     * Client for the shard
     *
     * @type {Client}
     */
    this.client = client;

    /**
     * Mode the shard was spawned with
     *
     * @type {ShardingManagerMode}
     */
    this.mode = mode;

    switch (mode) {
      case 'process':
        process.on('message', this._handleMessage.bind(this));
        client.on(Events.ClientReady, () => {
          process.send!({ _ready: true });
        });
        client.ws.on(WebSocketShardEvents.Closed, () => {
          process.send!({ _disconnect: true });
        });
        client.ws.on(WebSocketShardEvents.Resumed, () => {
          process.send!({ _resume: true });
        });
        break;
      case 'worker':
        self.onmessage = (event: MessageEvent) => {
          this._handleMessage(event.data);
        };
        client.on(Events.ClientReady, () => {
          self.postMessage({ _ready: true });
        });
        client.ws.on(WebSocketShardEvents.Closed, () => {
          self.postMessage({ _disconnect: true });
        });
        client.ws.on(WebSocketShardEvents.Resumed, () => {
          self.postMessage({ _resume: true });
        });
        break;
      default:
        break;
    }
  }

  /**
   * Sends a message to the master process.
   *
   * @param {*} message Message to send
   * @returns {Promise<void>}
   * @emits Shard#message
   */
  async send(message: any): Promise<void> {
    return new Promise((resolve, reject) => {
      switch (this.mode) {
        case 'process':
          process.send!(message, (err: Error | null) => {
            if (err) reject(err);
            else resolve(undefined);
          });
          break;
        case 'worker':
          self.postMessage(message);
          resolve(undefined);
          break;
        default:
          break;
      }
    });
  }

  /**
   * Fetches a client property value of each shard, or a given shard.
   *
   * @param {string} prop Name of the client property to get, using periods for nesting
   * @param {number} [shard] Shard to fetch property from, all if undefined
   * @returns {Promise<*|Array<*>>}
   * @example
   * client.shard.fetchClientValues('guilds.cache.size')
   *   .then(results => console.log(`${results.reduce((prev, val) => prev + val, 0)} total guilds`))
   *   .catch(console.error);
   * @see {@link ShardingManager#fetchClientValues}
   */
  async fetchClientValues(prop: any, shard: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.mode === 'worker') {
        const originalOnMessage = self.onmessage;
        self.onmessage = (event: MessageEvent) => {
          const message = event.data;
          if (message?._sFetchProp === prop && message._sFetchPropShard === shard) {
            self.onmessage = originalOnMessage;
            if (message._error) reject(makeError(message._error));
            else resolve(message._result);
          } else if (originalOnMessage) {
            originalOnMessage.call(self, event);
          }
        };
      } else {
        const listener = (message: any) => {
          if (message?._sFetchProp !== prop || message._sFetchPropShard !== shard) return;
          process.removeListener('message', listener);
          if (message._error) reject(makeError(message._error));
          else resolve(message._result);
        };
        process.on('message', listener);
      }

      this.send({ _sFetchProp: prop, _sFetchPropShard: shard }).catch(error => {
        reject(error);
      });
    });
  }

  /**
   * Evaluates a script or function on all shards, or a given shard, in the context of the {@link Client}s.
   *
   * @param {Function} script JavaScript to run on each shard
   * @param {BroadcastEvalOptions} [options={}] The options for the broadcast
   * @returns {Promise<*|Array<*>>} Results of the script execution
   * @example
   * client.shard.broadcastEval(client => client.guilds.cache.size)
   *   .then(results => console.log(`${results.reduce((prev, val) => prev + val, 0)} total guilds`))
   *   .catch(console.error);
   * @see {@link ShardingManager#broadcastEval}
   */
  async broadcastEval(script: any, options: any = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      if (typeof script !== 'function') {
        reject(new DiscordjsTypeError(ErrorCodes.ShardingInvalidEvalBroadcast));
        return;
      }

      const evalScript = `(${script})(this, ${JSON.stringify(options.context)})`;

      if (this.mode === 'worker') {
        const originalOnMessage = self.onmessage;
        self.onmessage = (event: MessageEvent) => {
          const message = event.data;
          if (message?._sEval === evalScript && message._sEvalShard === options.shard) {
            self.onmessage = originalOnMessage;
            if (message._error) reject(makeError(message._error));
            else resolve(message._result);
          } else if (originalOnMessage) {
            originalOnMessage.call(self, event);
          }
        };
      } else {
        const listener = (message: any) => {
          if (message?._sEval !== evalScript || message._sEvalShard !== options.shard) return;
          process.removeListener('message', listener);
          if (message._error) reject(makeError(message._error));
          else resolve(message._result);
        };
        process.on('message', listener);
      }

      this.send({ _sEval: evalScript, _sEvalShard: options.shard }).catch(error => {
        reject(error);
      });
    });
  }

  /**
   * Requests a respawn of all shards.
   *
   * @param {MultipleShardRespawnOptions} [options] Options for respawning shards
   * @returns {Promise<void>} Resolves upon the message being sent
   * @see {@link ShardingManager#respawnAll}
   */
  async respawnAll({ shardDelay = 5_000, respawnDelay = 500, timeout = 30_000 } = {}): Promise<void> {
    return this.send({ _sRespawnAll: { shardDelay, respawnDelay, timeout } });
  }

  /**
   * Handles an IPC message.
   *
   * @param {*} message Message received
   * @private
   */
  async _handleMessage(message: any): Promise<void> {
    if (!message) return;
    if (message._fetchProp) {
      try {
        const props = message._fetchProp.split('.');
        let value = this.client;
        for (const prop of props) value = value[prop];
        this._respond('fetchProp', { _fetchProp: message._fetchProp, _result: value });
      } catch (error) {
        this._respond('fetchProp', { _fetchProp: message._fetchProp, _error: makePlainError(error) });
      }
    } else if (message._eval) {
      try {
        this._respond('eval', { _eval: message._eval, _result: await this.client._eval(message._eval) });
      } catch (error) {
        this._respond('eval', { _eval: message._eval, _error: makePlainError(error) });
      }
    }
  }

  /**
   * Sends a message to the master process, emitting an error from the client upon failure.
   *
   * @param {string} type Type of response to send
   * @param {*} message Message to send
   * @private
   */
  _respond(type: string, message: any): void {
    this.send(message).catch(error_ => {
      const error = new Error(`Error when sending ${type} response to master process: ${error_.message}`);
      error.stack = error_.stack;
      /**
       * Emitted when the client encounters an error.
       *
       * @event Client#error
       * @param {Error} error The error encountered
       */
      this.client.emit(Events.Error, error);
    });
  }

  /**
   * Creates/gets the singleton of this class.
   *
   * @param {Client} client The client to use
   * @param {ShardingManagerMode} mode Mode the shard was spawned with
   * @returns {ShardClientUtil}
   */
  static singleton(client: any, mode: any): ShardClientUtil {
    if (this._singleton) {
      client.emit(
        Events.Warn,
        'Multiple clients created in child process/worker; only the first will handle sharding helpers.',
      );
    } else {
      this._singleton = new this(client, mode);
    }

    return this._singleton;
  }

  /**
   * Get the shard id for a given guild id.
   *
   * @param {Snowflake} guildId Snowflake guild id to get shard id for
   * @param {number} shardCount Number of shards
   * @returns {number}
   */
  static shardIdForGuildId(guildId: string, shardCount: number): number {
    const shard = calculateShardId(guildId, shardCount);
    if (shard < 0) throw new DiscordjsError(ErrorCodes.ShardingShardMiscalculation, shard, guildId, shardCount);
    return shard;
  }
}
