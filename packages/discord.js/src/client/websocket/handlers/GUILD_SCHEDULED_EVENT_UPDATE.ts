import type { Client } from '../../Client.js';
import type { GatewayDispatchPayload } from 'discord-api-types/v10';

import { Events  } from '../../../util/Events.js';

export default (client: Client, { d: data }: GatewayDispatchPayload) => {
  const guild = client.guilds.cache.get(data.guild_id);
  if (!guild) return;

  const oldGuildScheduledEvent = guild.scheduledEvents.cache.get(data.id)?._clone() ?? null;
  const newGuildScheduledEvent = guild.scheduledEvents._add(data);

  /**
   * Emitted whenever a guild scheduled event gets updated.
   *
   * @event Client#guildScheduledEventUpdate
   * @param {?GuildScheduledEvent} oldGuildScheduledEvent The guild scheduled event object before the update
   * @param {GuildScheduledEvent} newGuildScheduledEvent The guild scheduled event object after the update
   */
  client.emit(Events.GuildScheduledEventUpdate, oldGuildScheduledEvent, newGuildScheduledEvent);
};
