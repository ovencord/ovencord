import type { Client } from '../../Client.js';
import type { GatewayDispatchPayload } from 'discord-api-types/v10';

import { Events  } from '../../../util/Events.js';

export default (client: Client, { d: data }: GatewayDispatchPayload) => {
  const guild = client.guilds.cache.get(data.guild_id);
  if (!guild) return;

  /**
   * Emitted whenever a guild integration is updated
   *
   * @event Client#guildIntegrationsUpdate
   * @param {Guild} guild The guild whose integrations were updated
   */
  client.emit(Events.GuildIntegrationsUpdate, guild);
};
