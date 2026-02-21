import type { Client } from '../../Client.js';
import type { GatewayChannelUpdateDispatch } from 'discord-api-types/v10';
import { Events  } from '../../../util/Events.js';

export default (client: Client, packet: GatewayChannelUpdateDispatch) => {
  const { old, updated } = client.actions.ChannelUpdate.handle(packet.d);
  if (old && updated) {
    /**
     * Emitted whenever a channel is updated - e.g. name change, topic change, channel type change.
     *
     * @event Client#channelUpdate
     * @param {DMChannel|GuildChannel} oldChannel The channel before the update
     * @param {DMChannel|GuildChannel} newChannel The channel after the update
     */
    client.emit(Events.ChannelUpdate, old, updated);
  }
};
