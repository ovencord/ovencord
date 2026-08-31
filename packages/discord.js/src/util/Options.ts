import { Collection } from '@ovencord/collection';
import { DefaultRestOptions, DefaultUserAgentAppendix } from '@ovencord/rest';
import { DefaultWebSocketManagerOptions } from '@ovencord/ws';
import { version } from '../../package.json' with { type: 'json' };
import { LimitedCollection } from './LimitedCollection.js';
import { toSnakeCase } from './Transformers.js';

/**
 * @typedef {Object} CacheFactoryParams
 * @property {Function} holds The class that the cache will hold.
 * @property {Function} manager The fully extended manager class the cache is being requested from.
 * @property {Function} managerType The base manager class the cache is being requested from.
 */

/**
 * @typedef {Function} CacheFactory
 * @param {CacheFactoryParams} params The parameters
 * @returns {Collection} A Collection used to store the cache of the manager.
 */

/**
 * Options for a client.
 */
export interface ClientOptions {
	closeTimeout?: number;
	makeCache?: (params: any) => Collection<any, any>;
	allowedMentions?: any;
	partials?: any[];
	failIfNotExists?: boolean;
	presence?: any;
	intents?: any;
	waitGuildTimeout?: number;
	sweepers?: any;
	ws?: any;
	rest?: any;
	jsonTransformer?: (data: any) => any;
	enforceNonce?: boolean;
	token?: string;
}

/**
 * Options for {@link Sweepers} defining the behavior of cache sweeping
 *
 * @typedef {Object<SweeperKey, SweepOptions>} SweeperOptions
 */

/**
 * Options for sweeping a single type of item from cache
 *
 * @typedef {Object} SweepOptions
 * @property {number} interval The interval (in seconds) at which to perform sweeping of the item
 * @property {number} [lifetime] How long an item should stay in cache until it is considered sweepable.
 * <warn>This property is only valid for the `invites`, `messages`, and `threads` keys. The `filter` property
 * is mutually exclusive to this property and takes priority</warn>
 * @property {GlobalSweepFilter} filter The function used to determine the function passed to the sweep method
 * <info>This property is optional when the key is `invites`, `messages`, or `threads` and `lifetime` is set</info>
 */

import type { Partials } from './Partials.js';

export interface CacheFactoryParams {
	// biome-ignore lint/suspicious/noExplicitAny: constructor types for dynamic manager lookup
	holds: any;
	// biome-ignore lint/suspicious/noExplicitAny: constructor types for dynamic manager lookup
	manager: any;
	// biome-ignore lint/suspicious/noExplicitAny: constructor types for dynamic manager lookup
	managerType: any;
}

export type CacheFactory = (params: CacheFactoryParams) => Collection<any, any>;

export class Options extends null {
	/**
	 * The default user agent appendix.
	 *
	 * @type {string}
	 * @memberof Options
	 * @private
	 */
	static userAgentAppendix = `discord.js/${version} ${DefaultUserAgentAppendix}`.trimEnd();

	/**
	 * The default client options.
	 *
	 * @returns {ClientOptions}
	 */
	static createDefault() {
		return {
			closeTimeout: 5_000,
			waitGuildTimeout: 15_000,
			presence: {},
			makeCache: Options.cacheWithLimits(Options.DefaultMakeCacheSettings),
			partials: [] as Partials[],
			failIfNotExists: true,
			enforceNonce: false,
			sweepers: Options.DefaultSweeperSettings,
			ws: {
				...DefaultWebSocketManagerOptions,
				largeThreshold: 50,
				version: 10,
			},
			rest: {
				...DefaultRestOptions,
				userAgentAppendix: Options.userAgentAppendix,
			},
			jsonTransformer: toSnakeCase,
		};
	}

	/**
	 * Create a cache factory using predefined settings to sweep or limit.
	 *
	 * @param {Object<string, LimitedCollectionOptions|number>} [settings={}] Settings passed to the relevant constructor.
	 * If no setting is provided for a manager, it uses Collection.
	 * If a number is provided for a manager, it uses that number as the max size for a LimitedCollection.
	 * If LimitedCollectionOptions are provided for a manager, it uses those settings to form a LimitedCollection.
	 * @returns {CacheFactory}
	 * @example
	 * // Store up to 200 messages per channel and 200 members per guild, always keeping the client member.
	 * Options.cacheWithLimits({
	 *    MessageManager: 200,
	 *    GuildMemberManager: {
	 *      maxSize: 200,
	 *      keepOverLimit: (member) => member.id === client.user.id,
	 *    },
	 *  });
	 */
	static cacheWithLimits(settings: Record<string, any> = {}): CacheFactory {
		return ({ managerType, manager }: CacheFactoryParams) => {
			const setting = settings[manager.name] ?? settings[managerType.name];
			if (setting == null) {
				return new Collection();
			}

			if (typeof setting === 'number') {
				if (setting === Infinity) {
					return new Collection();
				}

				return new LimitedCollection({ maxSize: setting });
			}

			const noLimit = setting.maxSize == null || setting.maxSize === Infinity;
			if (noLimit) {
				return new Collection();
			}

			return new LimitedCollection(setting);
		};
	}

	/**
	 * Create a cache factory that always caches everything.
	 *
	 * @returns {CacheFactory}
	 */
	static cacheEverything() {
		return () => new Collection();
	}

	/**
	 * The default settings passed to {@link ClientOptions.makeCache}.
	 * The caches that this changes are:
	 * - `MessageManager` - Limit to 200 messages
	 * <info>If you want to keep default behavior and add on top of it you can use this object and add on to it, e.g.
	 * `makeCache: Options.cacheWithLimits({ ...Options.DefaultMakeCacheSettings, ReactionManager: 0 })`</info>
	 *
	 * @type {Object<string, LimitedCollectionOptions|number>}
	 */
	static get DefaultMakeCacheSettings() {
		return {
			MessageManager: 200,
		};
	}

	/**
	 * The default settings passed to {@link ClientOptions.sweepers}.
	 * The sweepers that this changes are:
	 * - `threads` - Sweep archived threads every hour, removing those archived more than 4 hours ago
	 * <info>If you want to keep default behavior and add on top of it you can use this object and add on to it, e.g.
	 * `sweepers: { ...Options.DefaultSweeperSettings, messages: { interval: 300, lifetime: 600 } }`</info>
	 *
	 * @type {SweeperOptions}
	 */
	static get DefaultSweeperSettings() {
		return {
			threads: {
				interval: 3_600,
				lifetime: 14_400,
			},
		};
	}
}

/**
 * @external RESTOptions
 * @see {@link https://discord.js.org/docs/packages/rest/stable/RESTOptions:Interface}
 */

/**
 * @external WebSocketManager
 * @see {@link https://discord.js.org/docs/packages/ws/stable/WebSocketManager:Class}
 */

/**
 * @external IShardingStrategy
 * @see {@link https://discord.js.org/docs/packages/ws/stable/IShardingStrategy:Interface}
 */

/**
 * @external IIdentifyThrottler
 * @see {@link https://discord.js.org/docs/packages/ws/stable/IIdentifyThrottler:Interface}
 */
