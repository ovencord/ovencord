import type { APIGuild, APIPartialGuild } from 'discord-api-types/v10';
import type { Client } from '../client/Client.js';
import { PermissionsBitField } from '../util/PermissionsBitField.js';
import { BaseGuild } from './BaseGuild.js';

/**
 * A partial guild received when using {@link GuildManager#fetch} to fetch multiple guilds.
 *
 * @extends {BaseGuild}
 */
export class OAuth2Guild extends BaseGuild {
	public owner: boolean;
	public permissions: Readonly<PermissionsBitField>;
	constructor(client: Client, data: APIPartialGuild & { owner?: boolean; permissions?: string }) {
		super(client, data as unknown as APIGuild);

		/**
		 * Whether the client user is the owner of the guild
		 *
		 * @type {boolean}
		 */
		this.owner = data.owner ?? false;

		/**
		 * The permissions that the client user has in this guild
		 *
		 * @type {Readonly<PermissionsBitField>}
		 */
		this.permissions = new PermissionsBitField(BigInt(data.permissions ?? 0)).freeze();
	}
}
