/* eslint-disable   no-use-before-define */

import { AsyncEventEmitter } from '../util/AsyncEventEmitter.js';
import { DiscordjsError, ErrorCodes } from '../errors/index.js';
import { ShardEvents } from '../util/ShardEvents.js';
import { makeError, makePlainError } from '../util/Util.js';

import type { Subprocess } from 'bun';

/**
 * A self-contained shard created by the {@link ShardingManager}. Each one has a {@link Subprocess} or {@link Worker}
 * that contains an instance of the bot and its {@link Client}. When its child process/worker exits for any reason,
 * the shard will spawn a new one to replace it as necessary.
 *
 * @extends {AsyncEventEmitter}
 */
export class Shard extends AsyncEventEmitter {
  public manager: any;
  public id: any;
  public silent: any;
  public args: any;
  public execArgv: any;
  public env: any;
  public worker: Worker | null = null;
  public process: Subprocess | null = null;
  public ready: boolean = false;
  public _evals: any;
  public _fetches: any;

  constructor(manager: any, id: any) {
    super();

    if (manager.mode !== 'process' && manager.mode !== 'worker') {
      throw new Error(`Invalid sharding mode in Shard ${id}`);
    }

    /**
     * Manager that created the shard
     *
     * @type {ShardingManager}
     */
    this.manager = manager;

    /**
     * The shard's id in the manager
     *
     * @type {number}
     */
    this.id = id;

    /**
     * Whether to pass silent flag to the shard's process (only when {@link ShardingManager#mode} is `process`)
     *
     * @type {boolean}
     */
    this.silent = manager.silent;

    /**
     * Arguments for the shard's process/worker
     *
     * @type {string[]}
     */
    this.args = manager.shardArgs ?? [];

    /**
     * Arguments for the shard's process/worker executable
     *
     * @type {string[]}
     */
    this.execArgv = manager.execArgv;

    /**
     * Environment variables for the shard's process/worker
     *
     * @type {Object}
     */
    this.env = {
      ...process.env,
      SHARDING_MANAGER: 'true',
      SHARDS: this.id,
      SHARD_COUNT: this.manager.totalShards,
      DISCORD_TOKEN: this.manager.token,
    };

    /**
     * Whether the shard's {@link Client} is ready
     *
     * @type {boolean}
     */
    this.ready = false;

    /**
     * Process of the shard (if {@link ShardingManager#mode} is `process`)
     *
     * @type {?Subprocess}
     */
    this.process = null;

    /**
     * Worker of the shard (if {@link ShardingManager#mode} is `worker`)
     *
     * @type {?Worker}
     */
    this.worker = null;

    /**
     * Ongoing promises for calls to {@link Shard#eval}, mapped by the `script` they were called with
     *
     * @type {Map<string, Promise>}
     * @private
     */
    this._evals = new Map();

    /**
     * Ongoing promises for calls to {@link Shard#fetchClientValue}, mapped by the `prop` they were called with
     *
     * @type {Map<string, Promise>}
     * @private
     */
    this._fetches = new Map();
  }

  /**
   * Forks a child process or creates a worker thread for the shard.
   * <warn>You should not need to call this manually.</warn>
   *
   * @param {number} [timeout=30000] The amount in milliseconds to wait until the {@link Client} has become ready
   * before resolving (`-1` or `Infinity` for no wait)
   * @returns {Promise<Subprocess|Worker>}
   */
  async spawn(timeout = 30_000) {
    if (this.process) throw new DiscordjsError(ErrorCodes.ShardingProcessExists, this.id);
    if (this.worker) throw new DiscordjsError(ErrorCodes.ShardingWorkerExists, this.id);

    const resolved = Bun.resolveSync(this.manager.file, process.cwd());

    switch (this.manager.mode) {
      case 'process': {
        this.process = Bun.spawn(['bun', resolved, ...this.args], {
          env: this.env,
          stdout: this.silent ? 'ignore' : 'inherit',
          stderr: this.silent ? 'ignore' : 'inherit',
          ipc: (message: any) => {
            this._handleMessage(message);
          },
          onExit: (_proc: any, exitCode: number | null, signalCode: number | null) => {
            this._handleExit(undefined, timeout);
          },
        });
        break;
      }
      case 'worker': {
        this.worker = new Worker(resolved, {
          env: this.env,
          argv: this.args,
        });
        this.worker.onmessage = (event: MessageEvent) => {
          this._handleMessage(event.data);
        };
        this.worker.addEventListener('error', (event: ErrorEvent) => {
          this.emit(ShardEvents.Error, event.error ?? event);
        });
        this.worker.addEventListener('close', () => {
          this._handleExit(undefined, timeout);
        });
        break;
      }
      default:
        break;
    }

    this._evals.clear();
    this._fetches.clear();

    const child = this.process ?? this.worker;

    /**
     * Emitted upon the creation of the shard's child process/worker.
     *
     * @event Shard#spawn
     * @param {Subprocess|Worker} process Child process/worker that was created
     */
    this.emit(ShardEvents.Spawn, child);

    if (timeout === -1 || timeout === Infinity) return child;
    return new Promise((resolve, reject) => {
      const cleanup = () => {
        clearTimeout(spawnTimeoutTimer);
        this.off('ready', onReady);
        this.off('disconnect', onDisconnect);
        this.off('death', onDeath);
      };

      const onReady = () => {
        cleanup();
        resolve(child);
      };

      const onDisconnect = () => {
        cleanup();
        reject(new DiscordjsError(ErrorCodes.ShardingReadyDisconnected, this.id));
      };

      const onDeath = () => {
        cleanup();
        reject(new DiscordjsError(ErrorCodes.ShardingReadyDied, this.id));
      };

      const onTimeout = () => {
        cleanup();
        reject(new DiscordjsError(ErrorCodes.ShardingReadyTimeout, this.id));
      };

      const spawnTimeoutTimer = setTimeout(onTimeout, timeout);
      this.once('ready', onReady);
      this.once('disconnect', onDisconnect);
      this.once('death', onDeath);
    });
  }

  /**
   * Immediately kills the shard's process/worker and does not restart it.
   */
  kill() {
    if (this.process) {
      this.process.kill();
    } else if (this.worker) {
      this.worker.terminate();
    }

    this._handleExit(false);
  }

  /**
   * Options used to respawn a shard.
   *
   * @typedef {Object} ShardRespawnOptions
   * @property {number} [delay=500] How long to wait between killing the process/worker and
   * restarting it (in milliseconds)
   * @property {number} [timeout=30000] The amount in milliseconds to wait until the {@link Client}
   * has become ready before resolving (`-1` or `Infinity` for no wait)
   */

  /**
   * Kills and restarts the shard's process/worker.
   *
   * @param {ShardRespawnOptions} [options] Options for respawning the shard
   * @returns {Promise<Subprocess|Worker>}
   */
  async respawn({ delay = 500, timeout = 30_000 } = {}) {
    this.kill();
    if (delay > 0) await Bun.sleep(delay);
    return this.spawn(timeout);
  }

  /**
   * Sends a message to the shard's process/worker.
   *
   * @param {*} message Message to send to the shard
   * @returns {Promise<Shard>}
   */
  async send(message: any): Promise<Shard> {
    if (this.process) {
      this.process.send(message);
    } else if (this.worker) {
      this.worker.postMessage(message);
    }
    return this;
  }

  /**
   * Fetches a client property value of the shard.
   *
   * @param {string} prop Name of the client property to get, using periods for nesting
   * @returns {Promise<*>}
   * @example
   * shard.fetchClientValue('guilds.cache.size')
   *   .then(count => console.log(`${count} guilds in shard ${shard.id}`))
   *   .catch(console.error);
   */
  async fetchClientValue(prop: any): Promise<any> {
    // Shard is dead (maybe respawning), don't cache anything and error immediately
    if (!this.process && !this.worker) {
      throw new DiscordjsError(ErrorCodes.ShardingNoChildExists, this.id);
    }

    // Cached promise from previous call
    if (this._fetches.has(prop)) return this._fetches.get(prop);

    const promise = new Promise((resolve, reject) => {
      const originalHandler = this._handleMessage.bind(this);

      const listener = (message: any) => {
        if (message?._fetchProp !== prop) return;
        // Remove this specific listener by replacing the handler
        this._fetches.delete(prop);
        if (message._error) reject(makeError(message._error));
        else resolve(message._result);
      };

      // For process mode, the ipc handler is already set up in spawn()
      // We handle this by storing the listener and checking in _handleMessage
      this._fetches.set(prop, { promise: null as any, listener });

      this.send({ _fetchProp: prop }).catch(error => {
        this._fetches.delete(prop);
        reject(error);
      });
    });

    // Store the actual promise
    this._fetches.set(prop, promise);
    return promise;
  }

  /**
   * Evaluates a script or function on the shard, in the context of the {@link Client}.
   *
   * @param {string|Function} script JavaScript to run on the shard
   * @param {*} [context] The context for the eval
   * @returns {Promise<*>} Result of the script execution
   */
  async eval(script: any, context?: any): Promise<any> {
    // Stringify the script if it's a Function
    const _eval = typeof script === 'function' ? `(${script})(this, ${JSON.stringify(context)})` : script;

    // Shard is dead (maybe respawning), don't cache anything and error immediately
    if (!this.process && !this.worker) {
      throw new DiscordjsError(ErrorCodes.ShardingNoChildExists, this.id);
    }

    // Cached promise from previous call
    if (this._evals.has(_eval)) return this._evals.get(_eval);

    const promise = new Promise((resolve, reject) => {
      this.send({ _eval }).catch(error => {
        this._evals.delete(_eval);
        reject(error);
      });
    });

    this._evals.set(_eval, promise);
    return promise;
  }

  /**
   * Handles a message received from the child process/worker.
   *
   * @param {*} message Message received
   * @private
   */
  _handleMessage(message: any): void {
    if (message) {
      // Shard is ready
      if (message._ready) {
        this.ready = true;
        /**
         * Emitted upon the shard's {@link Client#event:clientReady} event.
         *
         * @event Shard#ready
         */
        this.emit(ShardEvents.Ready);
        return;
      }

      // Shard has disconnected
      if (message._disconnect) {
        this.ready = false;
        /**
         * Emitted upon the shard's {@link WebSocketShardEvents#Closed} event.
         *
         * @event Shard#disconnect
         */
        this.emit(ShardEvents.Disconnect);
        return;
      }

      // Shard has resumed
      if (message._resume) {
        this.ready = true;
        /**
         * Emitted upon the shard's {@link WebSocketShardEvents#Resumed} event.
         *
         * @event Shard#resume
         */
        this.emit(ShardEvents.Resume);
        return;
      }

      // Shard is requesting a property fetch
      if (message._sFetchProp) {
        const resp = { _sFetchProp: message._sFetchProp, _sFetchPropShard: message._sFetchPropShard };
        this.manager.fetchClientValues(message._sFetchProp, message._sFetchPropShard).then(
          async results => this.send({ ...resp, _result: results }),
          async error => this.send({ ...resp, _error: makePlainError(error) }),
        );
        return;
      }

      // Shard is requesting an eval broadcast
      if (message._sEval) {
        const resp = { _sEval: message._sEval, _sEvalShard: message._sEvalShard };
        this.manager._performOnShards('eval', [message._sEval], message._sEvalShard).then(
          async results => this.send({ ...resp, _result: results }),
          async error => this.send({ ...resp, _error: makePlainError(error) }),
        );
        return;
      }

      // Shard is requesting a respawn of all shards
      if (message._sRespawnAll) {
        const { shardDelay, respawnDelay, timeout } = message._sRespawnAll;
        this.manager.respawnAll({ shardDelay, respawnDelay, timeout }).catch(() => {
          // Do nothing
        });
        return;
      }

      // Handle fetchClientValue responses
      if (message._fetchProp !== undefined) {
        const cached = this._fetches.get(message._fetchProp);
        if (cached && typeof cached === 'object' && cached.listener) {
          cached.listener(message);
          return;
        }
      }

      // Handle eval responses
      if (message._eval !== undefined) {
        const cached = this._evals.get(message._eval);
        if (cached && typeof cached === 'object' && cached.listener) {
          cached.listener(message);
          return;
        }
      }
    }

    /**
     * Emitted upon receiving a message from the child process/worker.
     *
     * @event Shard#message
     * @param {*} message Message that was received
     */
    this.emit(ShardEvents.Message, message);
  }

  /**
   * Handles the shard's process/worker exiting.
   *
   * @param {boolean} [respawn=this.manager.respawn] Whether to spawn the shard again
   * @param {number} [timeout] The amount in milliseconds to wait until the {@link Client}
   * has become ready (`-1` or `Infinity` for no wait)
   * @private
   */
  _handleExit(respawn = this.manager.respawn, timeout = undefined) {
    /**
     * Emitted upon the shard's child process/worker exiting.
     *
     * @event Shard#death
     * @param {Subprocess|Worker} process Child process/worker that exited
     */
    this.emit(ShardEvents.Death, this.process ?? this.worker);

    this.ready = false;
    this.process = null;
    this.worker = null;
    this._evals.clear();
    this._fetches.clear();

    if (respawn) this.spawn(timeout).catch(error => this.emit(ShardEvents.Error, error));
  }
}
