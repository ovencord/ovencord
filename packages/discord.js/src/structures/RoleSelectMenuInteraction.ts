import { Collection  } from '@ovencord/collection';
import { MessageComponentInteraction  } from './MessageComponentInteraction.js';

/**
 * Represents a {@link ComponentType.RoleSelect} select menu interaction.
 *
 * @extends {MessageComponentInteraction}
 */
export class RoleSelectMenuInteraction extends MessageComponentInteraction {
  public values: any;
  public roles: any;
  constructor(client: any, data: any) {
    super(client, data);
    const { resolved, values } = data.data;

    /**
     * An array of the selected role ids
     *
     * @type {Snowflake[]}
     */
    this.values = values ?? [];

    /**
     * Collection of the selected roles
     *
     * @type {Collection<Snowflake, Role|APIRole>}
     */
    this.roles = new Collection();

    for (const role of Object.values((resolved?.roles ?? {}) as any) as any[]) {
      this.roles.set(role.id, this.guild?.roles._add(role) ?? role);
    }
  }
}
