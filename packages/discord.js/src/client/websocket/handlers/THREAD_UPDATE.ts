import type { Client } from '../../Client.js';
import type { GatewayDispatchPayload } from 'discord-api-types/v10';

import { Events  } from '../../../util/Events.js';

export default (client: Client, packet: GatewayDispatchPayload) => {
  const { old, updated } = client.actions.ChannelUpdate.handle(packet.d);
  if (old && updated) {
    /**
     * Emitted whenever a thread is updated - e.g. name change, archive state change, locked state change.
     *
     * @event Client#threadUpdate
     * @param {ThreadChannel} oldThread The thread before the update
     * @param {ThreadChannel} newThread The thread after the update
     */
    client.emit(Events.ThreadUpdate, old, updated);
  }
};
