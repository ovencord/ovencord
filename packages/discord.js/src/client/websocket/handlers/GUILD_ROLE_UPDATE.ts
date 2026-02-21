import type { Client } from '../../Client.js';
import type { GatewayGuildRoleUpdateDispatch } from 'discord-api-types/v10';
import { Events  } from '../../../util/Events.js';

export default (client: Client, { d: data }: GatewayGuildRoleUpdateDispatch) => {
  const guild = client.guilds.cache.get(data.guild_id);
  if (!guild) return;

  const role = guild.roles.cache.get(data.role.id);
  if (!role) return;

  const old = role._update(data.role);

  /**
   * Emitted whenever a guild role is updated.
   *
   * @event Client#roleUpdate
   * @param {Role} oldRole The role before the update
   * @param {Role} newRole The role after the update
   */
  client.emit(Events.GuildRoleUpdate, old, role);
};
