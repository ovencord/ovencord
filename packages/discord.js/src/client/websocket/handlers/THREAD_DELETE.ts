import type { Client } from '../../Client.js';
import type { GatewayThreadDeleteDispatch } from 'discord-api-types/v10';
import { Events  } from '../../../util/Events.js';

export default (client: Client, { d: data }: GatewayThreadDeleteDispatch) => {
  const thread = client.channels.cache.get(data.id);
  if (!thread) return;

  client.channels._remove(thread.id);

  /**
   * Emitted whenever a thread is deleted.
   *
   * @event Client#threadDelete
   * @param {ThreadChannel} thread The thread that was deleted
   */
  client.emit(Events.ThreadDelete, thread);
};
