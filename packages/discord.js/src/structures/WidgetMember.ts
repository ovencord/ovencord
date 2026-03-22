import type { Snowflake } from 'discord-api-types/v10';
import type { Client } from '../client/Client.js';
import { Base } from './Base.js';

/**
 * Represents a WidgetMember.
 *
 * @extends {Base}
 */
export class WidgetMember extends Base {
	public id: string;
	public username: string;
	public discriminator: string;
	public avatar: string | null;
	public status: string;
	public deaf: boolean | null;
	public mute: boolean | null;
	public selfDeaf: boolean | null;
	public selfMute: boolean | null;
	public suppress: boolean | null;
	public channelId: Snowflake | null;
	public avatarURL: string;
	public activity: { name: string } | null;
	/**
	 * Activity sent in a {@link WidgetMember}.
	 *
	 * @typedef {Object} WidgetActivity
	 * @property {string} name The name of the activity
	 */

	constructor(client: Client, data: Record<string, unknown>) {
		super(client);

		/**
		 * The id of the user. It's an arbitrary number.
		 *
		 * @type {string}
		 */
		this.id = data.id as string;

		/**
		 * The username of the member.
		 *
		 * @type {string}
		 */
		this.username = data.username as string;

		/**
		 * The discriminator of the member.
		 *
		 * @type {string}
		 */
		this.discriminator = data.discriminator as string;

		/**
		 * The avatar of the member.
		 *
		 * @type {?string}
		 */
		this.avatar = (data.avatar as string) ?? null;

		/**
		 * The status of the member.
		 *
		 * @type {PresenceStatus}
		 */
		this.status = data.status as string;

		/**
		 * If the member is server deafened
		 *
		 * @type {?boolean}
		 */
		this.deaf = (data.deaf as boolean) ?? null;

		/**
		 * If the member is server muted
		 *
		 * @type {?boolean}
		 */
		this.mute = (data.mute as boolean) ?? null;

		/**
		 * If the member is self deafened
		 *
		 * @type {?boolean}
		 */
		this.selfDeaf = (data.self_deaf as boolean) ?? null;

		/**
		 * If the member is self muted
		 *
		 * @type {?boolean}
		 */
		this.selfMute = (data.self_mute as boolean) ?? null;

		/**
		 * If the member is suppressed
		 *
		 * @type {?boolean}
		 */
		this.suppress = (data.suppress as boolean) ?? null;

		/**
		 * The id of the voice channel the member is in, if any
		 *
		 * @type {?Snowflake}
		 */
		this.channelId = (data.channel_id as Snowflake) ?? null;

		/**
		 * The avatar URL of the member.
		 *
		 * @type {string}
		 */
		this.avatarURL = data.avatar_url as string;

		/**
		 * The activity of the member.
		 *
		 * @type {?WidgetActivity}
		 */
		this.activity = (data.activity as { name: string }) ?? null;
	}
}
