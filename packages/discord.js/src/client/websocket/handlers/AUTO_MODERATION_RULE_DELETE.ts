import type { Client } from '../../Client.js';
import type { GatewayAutoModerationRuleDeleteDispatch } from 'discord-api-types/v10';
import { Events  } from '../../../util/Events.js';

export default (client: Client, { d: data }: GatewayAutoModerationRuleDeleteDispatch) => {
  const guild = client.guilds.cache.get(data.guild_id);
  if (!guild) return;

  const autoModerationRule = guild.autoModerationRules.cache.get(data.id);
  if (!autoModerationRule) return;

  guild.autoModerationRules.cache.delete(autoModerationRule.id);

  /**
   * Emitted whenever an auto moderation rule is deleted.
   * <info>This event requires the {@link PermissionFlagsBits.ManageGuild} permission.</info>
   *
   * @event Client#autoModerationRuleDelete
   * @param {AutoModerationRule} autoModerationRule The deleted auto moderation rule
   */
  client.emit(Events.AutoModerationRuleDelete, autoModerationRule);
};
