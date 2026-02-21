import type { Client } from '../../Client.js';
import type { GatewayAutoModerationActionExecutionDispatch } from 'discord-api-types/v10';
import { AutoModerationActionExecution  } from '../../../structures/AutoModerationActionExecution.js';
import { Events  } from '../../../util/Events.js';

export default (client: Client, { d: data }: GatewayAutoModerationActionExecutionDispatch) => {
  const guild = client.guilds.cache.get(data.guild_id);
  if (!guild) return;

  /**
   * Emitted whenever an auto moderation rule is triggered.
   * <info>This event requires the {@link PermissionFlagsBits.ManageGuild} permission.</info>
   *
   * @event Client#autoModerationActionExecution
   * @param {AutoModerationActionExecution} autoModerationActionExecution The data of the execution
   */
  client.emit(Events.AutoModerationActionExecution, new AutoModerationActionExecution(data, guild));
};
