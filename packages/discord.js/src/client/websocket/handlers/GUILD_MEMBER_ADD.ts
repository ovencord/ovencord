import type { Client } from '../../Client.js';
import type { GatewayGuildMemberAddDispatch } from 'discord-api-types/v10';
import { Events  } from '../../../util/Events.js';

export default (client: Client, { d: data }: GatewayGuildMemberAddDispatch) => {
  const guild = client.guilds.cache.get(data.guild_id);
  if (guild) {
    guild.memberCount++;
    const member = guild.members._add(data);
    /**
     * Emitted whenever a user joins a guild.
     *
     * @event Client#guildMemberAdd
     * @param {GuildMember} member The member that has joined a guild
     */
    client.emit(Events.GuildMemberAdd, member);
  }
};
