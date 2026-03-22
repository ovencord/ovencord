import { Collection } from '@ovencord/collection';
import type { Snowflake } from 'discord-api-types/v10';
import { Routes } from 'discord-api-types/v10';
import type { Client } from '../client/Client.js';
import { Base } from './Base.js';
import { WidgetMember } from './WidgetMember.js';

/**
 * Represents a Widget.
 *
 * @extends {Base}
 */
export class Widget extends Base {
	public id: Snowflake;
	public name: string;
	public instantInvite: string | null;
	public channels: Collection<Snowflake, Record<string, unknown>>;
	public members: Collection<string, WidgetMember>;
	public presenceCount: number;
	constructor(client: Client, data: Record<string, unknown>) {
		super(client);
		this._patch(data);
	}

	/**
	 * Represents a channel in a Widget
	 *
	 * @typedef {Object} WidgetChannel
	 * @property {Snowflake} id Id of the channel
	 * @property {string} name Name of the channel
	 * @property {number} position Position of the channel
	 */

	_patch(data: Record<string, unknown>) {
		/**
		 * The id of the guild.
		 *
		 * @type {Snowflake}
		 */
		this.id = data.id as Snowflake;

		if ('name' in data) {
			/**
			 * The name of the guild.
			 *
			 * @type {string}
			 */
			this.name = data.name as string;
		}

		if ('instant_invite' in data) {
			/**
			 * The invite of the guild.
			 *
			 * @type {?string}
			 */
			this.instantInvite = (data.instant_invite as string) ?? null;
		} else {
			this.instantInvite ??= null;
		}

		/**
		 * The list of channels in the guild.
		 *
		 * @type {Collection<Snowflake, WidgetChannel>}
		 */
		this.channels = new Collection();
		if (Array.isArray(data.channels)) {
			for (const channel of data.channels as Record<string, unknown>[]) {
				this.channels.set(channel.id as Snowflake, channel);
			}
		}

		/**
		 * The list of members in the guild.
		 * These strings are just arbitrary numbers, they aren't Snowflakes.
		 *
		 * @type {Collection<string, WidgetMember>}
		 */
		this.members = new Collection();
		if (Array.isArray(data.members)) {
			for (const member of data.members as Record<string, unknown>[]) {
				this.members.set(member.id as string, new WidgetMember(this.client, member));
			}
		}

		if ('presence_count' in data) {
			/**
			 * The number of members online.
			 *
			 * @type {number}
			 */
			this.presenceCount = data.presence_count as number;
		}
	}

	/**
	 * Update the Widget.
	 *
	 * @returns {Promise<Widget>}
	 */
	async fetch() {
		const data = (await this.client.rest.get(Routes.guildWidgetJSON(this.id))) as Record<string, unknown>;
		this._patch(data);
		return this;
	}

	/**
	 * Returns a URL for the PNG widget of the guild.
	 *
	 * @param {GuildWidgetStyle} [style] The style for the widget image
	 * @returns {string}
	 */
	imageURL(style: string) {
		return this.client.guilds.widgetImageURL(this.id, style);
	}
}
