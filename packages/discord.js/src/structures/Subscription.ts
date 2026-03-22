import type { Snowflake, SubscriptionStatus } from 'discord-api-types/v10';
import type { Client } from '../client/Client.js';
import { Base } from './Base.js';

/**
 * Represents a Subscription
 *
 * @extends {Base}
 */
export class Subscription extends Base {
	public id: Snowflake;
	public userId: Snowflake;
	public skuIds: Snowflake[];
	public entitlementIds: Snowflake[];
	public currentPeriodStartTimestamp: number;
	public currentPeriodEndTimestamp: number;
	public status: SubscriptionStatus;
	public renewalSkuIds: Snowflake[] | null;
	public canceledTimestamp: number | null;
	public country: string | null;
	constructor(client: Client, data: Record<string, unknown>) {
		super(client);

		/**
		 * The id of the subscription
		 *
		 * @type {Snowflake}
		 */
		this.id = data.id as Snowflake;

		/**
		 * The id of the user who subscribed
		 *
		 * @type {Snowflake}
		 */
		this.userId = data.user_id as Snowflake;

		this._patch(data);
	}

	_patch(data: Record<string, unknown>) {
		/**
		 * The SKU ids subscribed to
		 *
		 * @type {Snowflake[]}
		 */
		this.skuIds = data.sku_ids as Snowflake[];

		/**
		 * The entitlement ids granted for this subscription
		 *
		 * @type {Snowflake[]}
		 */
		this.entitlementIds = data.entitlement_ids as Snowflake[];

		/**
		 * The timestamp the current subscription period will start at
		 *
		 * @type {number}
		 */
		this.currentPeriodStartTimestamp = Date.parse(data.current_period_start as string);

		/**
		 * The timestamp the current subscription period will end at
		 *
		 * @type {number}
		 */
		this.currentPeriodEndTimestamp = Date.parse(data.current_period_end as string);

		/**
		 * The current status of the subscription
		 *
		 * @type {SubscriptionStatus}
		 */
		this.status = data.status as SubscriptionStatus;

		if ('renewal_sku_ids' in data) {
			/**
			 * The SKU ids that this user will be subscribed to at renewal
			 *
			 * @type {?Snowflake[]}
			 */
			this.renewalSkuIds = data.renewal_sku_ids as Snowflake[];
		}

		if ('canceled_at' in data) {
			/**
			 * The timestamp of when the subscription was canceled
			 *
			 * @type {?number}
			 */
			this.canceledTimestamp = data.canceled_at ? Date.parse(data.canceled_at as string) : null;
		} else {
			this.canceledTimestamp ??= null;
		}

		if ('country' in data) {
			/**
			 * ISO 3166-1 alpha-2 country code of the payment source used to purchase the subscription.
			 * Missing unless queried with a private OAuth scope.
			 *
			 * @type {?string}
			 */
			this.country = data.country as string;
		} else {
			this.country ??= null;
		}
	}

	/**
	 * The time the subscription was canceled
	 *
	 * @type {?Date}
	 * @readonly
	 */
	get canceledAt() {
		return this.canceledTimestamp && new Date(this.canceledTimestamp);
	}

	/**
	 * The time the current subscription period will start at
	 *
	 * @type {Date}
	 * @readonly
	 */
	get currentPeriodStartAt() {
		return new Date(this.currentPeriodStartTimestamp);
	}

	/**
	 * The time the current subscription period will end at
	 *
	 * @type {Date}
	 * @readonly
	 */
	get currentPeriodEndAt() {
		return new Date(this.currentPeriodEndTimestamp);
	}
}
