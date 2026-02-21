import type { Client } from '../../Client.js';
import type { GatewayDispatchPayload } from 'discord-api-types/v10';

import { Events  } from '../../../util/Events.js';

export default (client: Client, { d: data }: GatewayDispatchPayload) => {
  const guild = client.guilds.cache.get(data.guild_id);
  if (!guild) return;

  const guildScheduledEvent = guild.scheduledEvents._add(data);

  /**
   * Emitted whenever a guild scheduled event is created.
   *
   * @event Client#guildScheduledEventCreate
   * @param {GuildScheduledEvent} guildScheduledEvent The created guild scheduled event
   */
  client.emit(Events.GuildScheduledEventCreate, guildScheduledEvent);
};
