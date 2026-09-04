import type { APIChannel, Snowflake } from 'discord-api-types/v10';
import type { Client } from '../client/Client.js';
import { BaseChannel } from './BaseChannel.js';
import type { InviteGuild } from './InviteGuild.js';

/**
 * Represents a channel that displays a directory of guilds.
 *
 * @extends {BaseChannel}
 */
export class DirectoryChannel extends BaseChannel {
	public guild: InviteGuild;
	public guildId: Snowflake;
	public name: string | null = null;
	constructor(guild: InviteGuild, data: APIChannel, client: Client) {
		super(client, data);

		/**
		 * The guild the channel is in
		 *
		 * @type {InviteGuild}
		 */
		this.guild = guild;

		/**
		 * The id of the guild the channel is in
		 *
		 * @type {Snowflake}
		 */
		this.guildId = guild.id;
	}

	override _patch(data: Partial<APIChannel>) {
		super._patch(data);
		/**
		 * The channel's name
		 *
		 * @type {string}
		 */
		this.name = data.name;
	}
}
