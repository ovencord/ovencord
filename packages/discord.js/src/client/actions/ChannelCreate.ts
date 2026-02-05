import { Events  } from '../../util/Events.js';
import { Action  } from './Action.js';

export class ChannelCreateAction extends Action {
  override handle(data: any) {
    const client = this.client;
    const existing = client.channels.cache.has(data.id);
    const channel = client.channels._add(data, client.guilds.cache.get(data.guild_id) ?? null);
    if (!existing && channel) {
      /**
       * Emitted whenever a guild channel is created.
       *
       * @event Client#channelCreate
       * @param {GuildChannel} channel The channel that was created
       */
      client.emit(Events.ChannelCreate, channel);
    }

    return { channel };
  }
}
