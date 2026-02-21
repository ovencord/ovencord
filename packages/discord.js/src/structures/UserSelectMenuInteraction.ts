import { Collection  } from '@ovencord/collection';
import { Events  } from '../util/Events.js';
import { MessageComponentInteraction  } from './MessageComponentInteraction.js';

/**
 * Represents a {@link ComponentType.UserSelect} select menu interaction.
 *
 * @extends {MessageComponentInteraction}
 */
export class UserSelectMenuInteraction extends MessageComponentInteraction {
  public users: any;
  public members: any;
  public values: any;
  constructor(client: any, data: any) {
    super(client, data);
    const { resolved, values } = data.data;

    /**
     * An array of the selected user ids
     *
     * @type {Snowflake[]}
     */
    this.values = values ?? [];

    /**
     * Collection of the selected users
     *
     * @type {Collection<Snowflake, User>}
     */
    this.users = new Collection();

    /**
     * Collection of the selected members
     *
     * @type {Collection<Snowflake, GuildMember|APIGuildMember>}
     */
    this.members = new Collection();

    for (const user of Object.values((resolved?.users ?? {}) as any) as any[]) {
      this.users.set(user.id, this.client.users._add(user));
    }

    for (const [id, member] of Object.entries((resolved?.members ?? {}) as any) as any[]) {
      const user = resolved.users[id];

      if (!user) {
        this.client.emit(Events.Debug, `[UserSelectMenuInteraction] Received a member without a user, skipping ${id}`);
        continue;
      }

      this.members.set(id, this.guild?.members._add(Object.assign({ user }, member)) ?? Object.assign({ user }, member));
    }
  }
}
