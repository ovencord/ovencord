import type { Client } from '../../Client.js';
import type { GatewaySubscriptionDeleteDispatch } from 'discord-api-types/v10';
import { Events  } from '../../../util/Events.js';

export default (client: Client, { d: data }: GatewaySubscriptionDeleteDispatch) => {
  const subscription = client.application.subscriptions._add(data, false);

  client.application.subscriptions.cache.delete(subscription.id);

  /**
   * Emitted whenever a subscription is deleted.
   *
   * @event Client#subscriptionDelete
   * @param {Subscription} subscription The subscription that was deleted
   */
  client.emit(Events.SubscriptionDelete, subscription);
};
