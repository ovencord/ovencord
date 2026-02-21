import type { Client } from '../../Client.js';
import type { GatewayDispatchPayload } from 'discord-api-types/v10';

import { GuildBan  } from '../../../structures/GuildBan.js';
import { Events  } from '../../../util/Events.js';

export default (client: Client, { d: data }: GatewayDispatchPayload) => {
  const guild = client.guilds.cache.get(data.guild_id);
  if (!guild) return;

  const ban = guild.bans.cache.get(data.user.id) ?? new GuildBan(client, data, guild);

  guild.bans.cache.delete(ban.user.id);

  /**
   * Emitted whenever a member is unbanned from a guild.
   *
   * @event Client#guildBanRemove
   * @param {GuildBan} ban The ban that was removed
   */
  client.emit(Events.GuildBanRemove, ban);
};
