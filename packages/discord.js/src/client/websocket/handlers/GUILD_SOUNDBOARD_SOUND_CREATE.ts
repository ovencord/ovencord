import type { Client } from '../../Client.js';
import type { GatewayDispatchPayload } from 'discord-api-types/v10';

import { Events  } from '../../../util/Events.js';

export default (client: Client, { d: data }: GatewayDispatchPayload) => {
  const guild = client.guilds.cache.get(data.guild_id);

  if (!guild) return;

  const soundboardSound = guild.soundboardSounds._add(data);

  /**
   * Emitted whenever a guild soundboard sound is created.
   *
   * @event Client#guildSoundboardSoundCreate
   * @param {SoundboardSound} soundboardSound The created guild soundboard sound
   */
  client.emit(Events.GuildSoundboardSoundCreate, soundboardSound);
};
