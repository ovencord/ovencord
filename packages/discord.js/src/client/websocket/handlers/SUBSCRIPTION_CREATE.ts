import type { Client } from '../../Client.js';
import type { GatewaySubscriptionCreateDispatch } from 'discord-api-types/v10';
import { Events  } from '../../../util/Events.js';

export default (client: Client, { d: data }: GatewaySubscriptionCreateDispatch) => {
  const subscription = client.application!.subscriptions._add(data);

  /**
   * Emitted whenever a subscription is created.
   *
   * @event Client#subscriptionCreate
   * @param {Subscription} subscription The subscription that was created
   */
  client.emit(Events.SubscriptionCreate, subscription);
};
