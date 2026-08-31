import { Collection } from '@ovencord/collection';
import { makeURLSearchParams } from '@ovencord/rest';
import type { Snowflake } from 'discord-api-types/v10';
import { Routes } from 'discord-api-types/v10';
import type { Client } from '../client/Client.js';
import { DiscordjsTypeError, ErrorCodes } from '../errors/index.js';
import type { SKU } from '../structures/SKU.js';
import { Subscription } from '../structures/Subscription.js';
import { resolveSKUId } from '../util/Util.js';
import { CachedManager } from './CachedManager.js';
import type { BaseFetchOptions, UserResolvable } from './UserManager.js';

export type SKUResolvable = SKU | Snowflake | string;

export interface FetchSubscriptionOptions extends BaseFetchOptions {
	sku: SKUResolvable;
	subscriptionId: Snowflake;
}

export interface FetchSubscriptionsOptions {
	sku: SKUResolvable;
	user?: UserResolvable;
	after?: Snowflake;
	before?: Snowflake;
	limit?: number;
	cache?: boolean;
}

/**
 * Manages API methods for subscriptions and stores their cache.
 *
 * @extends {CachedManager}
 */
export class SubscriptionManager extends CachedManager<Snowflake, Subscription, Snowflake> {
	// biome-ignore lint/suspicious/noExplicitAny: iterable hydration
	constructor(client: Client, iterable?: Iterable<any>) {
		super(client, Subscription, iterable);
	}

	/**
	 * Fetches subscriptions for this application
	 *
	 * @param {FetchSubscriptionOptions|FetchSubscriptionsOptions} options Options for fetching the subscriptions
	 * @returns {Promise<Subscription|Collection<Snowflake, Subscription>>}
	 */
	async fetch(
		options: FetchSubscriptionOptions | FetchSubscriptionsOptions,
	): Promise<Subscription | Collection<Snowflake, Subscription>> {
		if (typeof options !== 'object' || options === null) {
			throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'options', 'object', true);
		}

		const { after, before, cache, limit, sku, subscriptionId, user } = options as FetchSubscriptionOptions &
			FetchSubscriptionsOptions;

		const skuId = resolveSKUId(sku);

		if (!skuId) throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'sku', 'SKUResolvable');

		if (subscriptionId) {
			// biome-ignore lint/suspicious/noExplicitAny: subscription REST payload
			const subscription = (await this.client.rest.get(Routes.skuSubscription(skuId, subscriptionId))) as any;

			return this._add(subscription, cache);
		}

		const query = makeURLSearchParams({
			limit,
			user_id: (user && this.client.users.resolveId(user)) || undefined,
			sku_id: skuId,
			before,
			after,
		});

		// biome-ignore lint/suspicious/noExplicitAny: subscriptions REST payload
		const subscriptions = (await this.client.rest.get(Routes.skuSubscriptions(skuId), { query })) as any[];

		return subscriptions.reduce(
			// biome-ignore lint/suspicious/noExplicitAny: reducer accumulation
			(coll: Collection<Snowflake, Subscription>, subscription: any) =>
				coll.set(subscription.id, this._add(subscription, cache)),
			new Collection(),
		);
	}
}
