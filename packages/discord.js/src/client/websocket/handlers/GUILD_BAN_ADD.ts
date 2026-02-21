import type { Client } from '../../Client.js';
import type { GatewayGuildBanAddDispatch } from 'discord-api-types/v10';
import { Events  } from '../../../util/Events.js';

export default (client: Client, { d: data }: GatewayGuildBanAddDispatch) => {
  const guild = client.guilds.cache.get(data.guild_id);
  if (!guild) return;

  /**
   * Emitted whenever a member is banned from a guild.
   *
   * @event Client#guildBanAdd
   * @param {GuildBan} ban The ban that occurred
   */
  client.emit(Events.GuildBanAdd, guild.bans._add(data));
};
