import { Collection } from '@ovencord/collection';
import { DiscordSnowflake } from '@ovencord/util';
import type { APITeam, Snowflake } from 'discord-api-types/v10';
import type { Client } from '../client/Client.js';
import { Base } from './Base.js';
import { TeamMember } from './TeamMember.js';

/**
 * Represents a Client OAuth2 Application Team.
 *
 * @extends {Base}
 */
export class Team extends Base {
	public id: Snowflake;
	public name: string;
	public icon: string | null;
	public ownerId: Snowflake | null;
	public members: Collection<Snowflake, TeamMember>;
	constructor(client: Client, data: APITeam) {
		super(client);
		this._patch(data);
	}

	_patch(data: Partial<APITeam>) {
		/**
		 * The Team's id
		 *
		 * @type {Snowflake}
		 */
		this.id = data.id!;

		if ('name' in data) {
			/**
			 * The name of the Team
			 *
			 * @type {string}
			 */
			this.name = data.name!;
		}

		if ('icon' in data) {
			/**
			 * The Team's icon hash
			 *
			 * @type {?string}
			 */
			this.icon = data.icon!;
		} else {
			this.icon ??= null;
		}

		if ('owner_user_id' in data) {
			/**
			 * The Team's owner id
			 *
			 * @type {?Snowflake}
			 */
			this.ownerId = data.owner_user_id!;
		} else {
			this.ownerId ??= null;
		}

		/**
		 * The Team's members
		 *
		 * @type {Collection<Snowflake, TeamMember>}
		 */
		this.members = new Collection();

		if (data.members) {
			for (const memberData of data.members) {
				const member = new TeamMember(this, memberData);
				this.members.set(member.id, member);
			}
		}
	}

	/**
	 * The owner of this team
	 *
	 * @type {?TeamMember}
	 * @readonly
	 */
	get owner() {
		return this.members.get(this.ownerId) ?? null;
	}

	/**
	 * The timestamp the team was created at
	 *
	 * @type {number}
	 * @readonly
	 */
	get createdTimestamp() {
		return DiscordSnowflake.timestampFrom(this.id);
	}

	/**
	 * The time the team was created at
	 *
	 * @type {Date}
	 * @readonly
	 */
	get createdAt() {
		return new Date(this.createdTimestamp);
	}

	/**
	 * A link to the team's icon.
	 *
	 * @param {ImageURLOptions} [options={}] Options for the image URL
	 * @returns {?string}
	 */
	iconURL(options = {}) {
		return this.icon && this.client.rest.cdn.teamIcon(this.id, this.icon, options);
	}

	/**
	 * When concatenated with a string, this automatically returns the Team's name instead of the
	 * Team object.
	 *
	 * @returns {string}
	 * @example
	 * // Logs: Team name: My Team
	 * console.log(`Team name: ${team}`);
	 */
	toString() {
		return this.name;
	}

	toJSON() {
		return super.toJSON({ createdTimestamp: true });
	}
}
