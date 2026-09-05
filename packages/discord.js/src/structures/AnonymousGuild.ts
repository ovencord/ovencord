import type {
	APIGuild,
	APIPartialGuild,
	GuildFeature,
	GuildNSFWLevel,
	GuildVerificationLevel,
} from 'discord-api-types/v10';
import type { Client } from '../client/Client.js';
import { BaseGuild } from './BaseGuild.js';

/**
 * Bundles common attributes and methods between {@link Guild} and {@link InviteGuild}
 *
 * @extends {BaseGuild}
 * @abstract
 */
export class AnonymousGuild extends BaseGuild {
	declare public features: GuildFeature[];
	public description: string | null;
	public verificationLevel: GuildVerificationLevel;
	public vanityURLCode: string | null;
	public nsfwLevel: GuildNSFWLevel;
	public splash: string | null;
	public banner: string | null;
	public premiumSubscriptionCount: number | null;
	constructor(client: Client, data: APIPartialGuild, immediatePatch = true) {
		super(client, data);
		this.description = null;
		this.verificationLevel = 0 as GuildVerificationLevel;
		this.vanityURLCode = null;
		this.nsfwLevel = 0 as GuildNSFWLevel;
		this.splash = data.splash;
		this.banner = null;
		this.premiumSubscriptionCount = null;
		if (immediatePatch) this._patch(data);
	}

	_patch(data: Partial<APIGuild>) {
		if ('features' in data && data.features) this.features = data.features;

		if ('splash' in data) {
			/**
			 * The hash of the guild invite splash image
			 *
			 * @type {?string}
			 */
			this.splash = data.splash ?? null;
		}

		if ('banner' in data) {
			/**
			 * The hash of the guild banner
			 *
			 * @type {?string}
			 */
			this.banner = data.banner ?? null;
		}

		if ('description' in data) {
			/**
			 * The description of the guild, if any
			 *
			 * @type {?string}
			 */
			this.description = data.description ?? null;
		}

		if ('verification_level' in data && data.verification_level !== undefined) {
			/**
			 * The verification level of the guild
			 *
			 * @type {GuildVerificationLevel}
			 */
			this.verificationLevel = data.verification_level;
		}

		if ('vanity_url_code' in data) {
			/**
			 * The vanity invite code of the guild, if any
			 *
			 * @type {?string}
			 */
			this.vanityURLCode = data.vanity_url_code ?? null;
		}

		if ('nsfw_level' in data && data.nsfw_level !== undefined) {
			/**
			 * The NSFW level of this guild
			 *
			 * @type {GuildNSFWLevel}
			 */
			this.nsfwLevel = data.nsfw_level;
		}

		if ('premium_subscription_count' in data) {
			/**
			 * The total number of boosts for this server
			 *
			 * @type {?number}
			 */
			this.premiumSubscriptionCount = data.premium_subscription_count ?? null;
		} else {
			this.premiumSubscriptionCount ??= null;
		}
	}

	/**
	 * The URL to this guild's banner.
	 *
	 * @param {ImageURLOptions} [options={}] Options for the image URL
	 * @returns {?string}
	 */
	bannerURL(options = {}) {
		return this.banner && this.client.rest.cdn.banner(this.id, this.banner, options);
	}

	/**
	 * The URL to this guild's invite splash image.
	 *
	 * @param {ImageURLOptions} [options={}] Options for the image URL
	 * @returns {?string}
	 */
	splashURL(options = {}) {
		return this.splash && this.client.rest.cdn.splash(this.id, this.splash, options);
	}
}
