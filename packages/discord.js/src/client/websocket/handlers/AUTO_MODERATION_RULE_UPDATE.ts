import type { Client } from '../../Client.js';
import type { GatewayAutoModerationRuleUpdateDispatch } from 'discord-api-types/v10';
import { Events  } from '../../../util/Events.js';

export default (client: Client, { d: data }: GatewayAutoModerationRuleUpdateDispatch) => {
  const guild = client.guilds.cache.get(data.guild_id);
  if (!guild) return;

  const oldAutoModerationRule = guild.autoModerationRules.cache.get(data.id)?._clone() ?? null;
  const newAutoModerationRule = guild.autoModerationRules._add(data);

  /**
   * Emitted whenever an auto moderation rule gets updated.
   * <info>This event requires the {@link PermissionFlagsBits.ManageGuild} permission.</info>
   *
   * @event Client#autoModerationRuleUpdate
   * @param {?AutoModerationRule} oldAutoModerationRule The auto moderation rule before the update
   * @param {AutoModerationRule} newAutoModerationRule The auto moderation rule after the update
   */
  client.emit(Events.AutoModerationRuleUpdate, oldAutoModerationRule, newAutoModerationRule);
};
