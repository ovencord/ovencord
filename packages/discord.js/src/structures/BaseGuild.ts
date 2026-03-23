import { type ImageURLOptions, makeURLSearchParams } from '@ovencord/rest';
import { DiscordSnowflake } from '@ovencord/util';
import type { APIPartialGuild, Snowflake } from 'discord-api-types/v10';
import { GuildFeature, Routes } from 'discord-api-types/v10';
import type { Client } from '../client/Client.js';
import { Base } from './Base.js';

/**
 * The base class for {@link Guild}, {@link OAuth2Guild} and {@link InviteGuild}.
 *
 * @extends {Base}
 * @abstract
 */
export class BaseGuild extends Base {
	public id: Snowflake;
	public name: string;
	public features: GuildFeature[];
	public icon: string | null;
	constructor(client: Client, data: APIPartialGuild) {
		super(client);

		/**
		 * The guild's id
		 *
		 * @type {Snowflake}
		 */
		this.id = data.id;

		/**
		 * The name of this guild
		 *
		 * @type {string}
		 */
		this.name = data.name;

		/**
		 * The icon hash of this guild
		 *
		 * @type {?string}
		 */
		this.icon = data.icon;

		/**
		 * An array of features available to this guild
		 *
		 * @type {GuildFeature[]}
		 */
		this.features = data.features;
	}

	/**
	 * The timestamp this guild was created at
	 *
	 * @type {number}
	 * @readonly
	 */
	get createdTimestamp() {
		return DiscordSnowflake.timestampFrom(this.id);
	}

	/**
	 * The time this guild was created at
	 *
	 * @type {Date}
	 * @readonly
	 */
	get createdAt() {
		return new Date(this.createdTimestamp);
	}

	/**
	 * The acronym that shows up in place of a guild icon
	 *
	 * @type {string}
	 * @readonly
	 */
	get nameAcronym() {
		return this.name
			.replace(/'s /g, ' ')
			.replace(/\w+/g, (word: string) => word[0] as string)
			.replace(/\s/g, '');
	}

	/**
	 * Whether this guild is partnered
	 *
	 * @type {boolean}
	 * @readonly
	 */
	get partnered() {
		return this.features.includes(GuildFeature.Partnered);
	}

	/**
	 * Whether this guild is verified
	 *
	 * @type {boolean}
	 * @readonly
	 */
	get verified() {
		return this.features.includes(GuildFeature.Verified);
	}

	/**
	 * The URL to this guild's icon.
	 *
	 * @param {ImageURLOptions} [options={}] Options for the image URL
	 * @returns {?string}
	 */
	iconURL(options: ImageURLOptions = {}) {
		return this.icon && this.client.rest.cdn.icon(this.id, this.icon, options);
	}

	/**
	 * Fetches this guild.
	 *
	 * @returns {Promise<Guild>}
	 */
	async fetch() {
		const data = await this.client.rest.get(Routes.guild(this.id), {
			query: makeURLSearchParams({ with_counts: true }),
		});
		return this.client.guilds._add(data);
	}

	/**
	 * When concatenated with a string, this automatically returns the guild's name instead of the Guild object.
	 *
	 * @returns {string}
	 */
	toJSON(): Record<string, unknown> {
		return super.toJSON({
			name: true,
			icon: true,
			features: true,
			createdTimestamp: true,
		});
	}

	toString(): string {
		return this.name;
	}
}
