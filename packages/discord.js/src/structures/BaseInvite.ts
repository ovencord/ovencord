import { type APIInvite, type InviteType, RouteBases, type Snowflake } from 'discord-api-types/v10';
import type { Client } from '../client/Client.js';
import { Base } from './Base.js';
import type { User } from './User.js';

/**
 * The base invite class.
 *
 * @extends {Base}
 */
export class BaseInvite extends Base {
	public type: InviteType;
	public code: string;
	public inviterId: Snowflake | null;
	public maxAge: number | null;
	public createdTimestamp: number | null;
	public _expiresTimestamp: number | null;
	public channelId: Snowflake | null;
	public approximateMemberCount: number | null;
	constructor(client: Client, data: APIInvite) {
		super(client);

		/**
		 * The type of this invite.
		 *
		 * @type {InviteType}
		 */
		this.type = data.type;

		/**
		 * The invite code.
		 *
		 * @type {string}
		 */
		this.code = data.code;

		this._patch(data);
	}

	_patch(data: Partial<APIInvite>) {
		if ('inviter_id' in data) {
			/**
			 * The id of the user that created this invite.
			 *
			 * @type {?Snowflake}
			 */
			this.inviterId = data.inviter_id as Snowflake | null;
		} else {
			this.inviterId ??= null;
		}

		if ('inviter' in data && data.inviter) {
			this.client.users._add(data.inviter);
			this.inviterId ??= data.inviter.id;
		}

		if ('max_age' in data) {
			/**
			 * The maximum age of the invite in seconds. `0` for no expiry.
			 *
			 * @type {?number}
			 */
			this.maxAge = data.max_age as number | null;
		} else {
			this.maxAge ??= null;
		}

		if ('created_at' in data) {
			/**
			 * The timestamp this invite was created at.
			 *
			 * @type {?number}
			 */
			this.createdTimestamp = Date.parse(data.created_at as string);
		} else {
			this.createdTimestamp ??= null;
		}

		if ('expires_at' in data) {
			this._expiresTimestamp = data.expires_at && Date.parse(data.expires_at as string);
		} else {
			this._expiresTimestamp ??= null;
		}

		if ('channel_id' in data) {
			/**
			 * The id of the channel this invite is for.
			 *
			 * @type {?Snowflake}
			 */
			this.channelId = data.channel_id as Snowflake | null;
		}

		if ('approximate_member_count' in data) {
			/**
			 * The approximate total number of members.
			 *
			 * @type {?number}
			 */
			this.approximateMemberCount = data.approximate_member_count as number | null;
		} else {
			this.approximateMemberCount ??= null;
		}
	}

	/**
	 * The user that created this invite.
	 *
	 * @type {?User}
	 * @readonly
	 */
	get inviter(): User | null {
		return this.inviterId ? this.client.users.resolve(this.inviterId) : null;
	}

	/**
	 * The creation date of this invite.
	 *
	 * @type {?Date}
	 * @readonly
	 */
	get createdAt() {
		return this.createdTimestamp && new Date(this.createdTimestamp);
	}

	/**
	 * The timestamp this invite expires at.
	 *
	 * @type {?number}
	 * @readonly
	 */
	get expiresTimestamp() {
		return (
			this._expiresTimestamp ??
			(this.createdTimestamp && this.maxAge ? this.createdTimestamp + this.maxAge * 1_000 : null)
		);
	}

	/**
	 * The expiry date of this invite.
	 *
	 * @type {?Date}
	 * @readonly
	 */
	get expiresAt() {
		return this.expiresTimestamp && new Date(this.expiresTimestamp);
	}

	/**
	 * The URL to the invite.
	 *
	 * @type {string}
	 * @readonly
	 */
	get url() {
		return `${RouteBases.invite}/${this.code}`;
	}

	/**
	 * A regular expression that matches Discord invite links.
	 * The `code` group property is present on the `exec()` result of this expression.
	 *
	 * @type {RegExp}
	 * @memberof BaseInvite
	 */
	static InvitesPattern = /discord(?:(?:app)?\.com\/invite|\.gg(?:\/invite)?)\/(?<code>[\w-]{2,255})/i;

	/**
	 * When concatenated with a string, this automatically concatenates the invite's URL instead of the object.
	 *
	 * @returns {string}
	 * @example
	 * // Logs: Invite: https://discord.gg/djs
	 * console.log(`Invite: ${invite}`);
	 */
	toString() {
		return this.url;
	}

	toJSON(): Record<string, unknown> {
		return super.toJSON({
			url: true,
			expiresTimestamp: true,
			uses: false,
			channel: 'channelId',
			inviter: 'inviterId',
		});
	}

	valueOf() {
		return this.code;
	}
}
