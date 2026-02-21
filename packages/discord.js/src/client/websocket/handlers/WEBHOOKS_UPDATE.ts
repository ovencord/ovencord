import type { Client } from '../../Client.js';
import type { GatewayWebhooksUpdateDispatch } from 'discord-api-types/v10';
import { Events  } from '../../../util/Events.js';

export default (client: Client, { d: data }: GatewayWebhooksUpdateDispatch) => {
  const channel = client.channels.cache.get(data.channel_id);
  if (!channel) return;

  /**
   * Emitted whenever a channel has its webhooks changed.
   *
   * @event Client#webhooksUpdate
   * @param {TextChannel|AnnouncementChannel|VoiceChannel|StageChannel|ForumChannel|MediaChannel} channel
   * The channel that had a webhook update
   */
  client.emit(Events.WebhooksUpdate, channel);
};
