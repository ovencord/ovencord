import type { APITeamMember, TeamMemberMembershipState, TeamMemberRole } from 'discord-api-types/v10';
import { Base } from './Base.js';
import type { Team } from './Team.js';
import type { User } from './User.js';

/**
 * Represents a Client OAuth2 Application Team Member.
 *
 * @extends {Base}
 */
export class TeamMember extends Base {
	public team: Team;
	public membershipState: TeamMemberMembershipState;
	public user: User;
	public role: TeamMemberRole;
	constructor(team: Team, data: APITeamMember) {
		super(team.client);

		/**
		 * The Team this member is part of
		 *
		 * @type {Team}
		 */
		this.team = team;

		this._patch(data);
	}

	_patch(data: Partial<APITeamMember>) {
		if (data.membership_state !== undefined) {
			/**
			 * The permissions this Team Member has with regard to the team
			 *
			 * @type {TeamMemberMembershipState}
			 */
			this.membershipState = data.membership_state;
		}

		if (data.user) {
			/**
			 * The user for this Team Member
			 *
			 * @type {User}
			 */
			this.user = this.client.users._add(data.user);
		}

		if (data.role !== undefined) {
			/**
			 * The role of this Team Member
			 *
			 * @type {TeamMemberRole}
			 */
			this.role = data.role;
		}
	}

	/**
	 * The Team Member's id
	 *
	 * @type {Snowflake}
	 * @readonly
	 */
	get id() {
		return this.user.id;
	}

	/**
	 * When concatenated with a string, this automatically returns the team member's mention instead of the
	 * TeamMember object.
	 *
	 * @returns {string}
	 * @example
	 * // Logs: Team Member's mention: <@123456789012345678>
	 * console.log(`Team Member's mention: ${teamMember}`);
	 */
	toString() {
		return this.user.toString();
	}
}
