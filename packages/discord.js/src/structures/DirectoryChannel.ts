import { BaseChannel  } from './BaseChannel.js';

/**
 * Represents a channel that displays a directory of guilds.
 *
 * @extends {BaseChannel}
 */
export class DirectoryChannel extends BaseChannel {
  public guild: any;
  public guildId: any;
  public name: any;
  constructor(guild: any, data: any, client: any) {
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

  _patch(data: any) {
    super._patch(data);
    /**
     * The channel's name
     *
     * @type {string}
     */
    this.name = data.name;
  }
}
