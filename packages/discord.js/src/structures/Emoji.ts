
import { formatEmoji  } from '@ovencord/formatters';
import { DiscordSnowflake  } from '@sapphire/snowflake';
import { Base  } from './Base.js';

/**
 * Represents an emoji, see {@link ApplicationEmoji}, {@link GuildEmoji} and {@link ReactionEmoji}.
 *
 * @extends {Base}
 */
export class Emoji extends Base {
  public animated: boolean | null;
  public name: string | null;
  public id: string | null;

  constructor(client: any, emoji: any) {
    super(client);
    this.animated = emoji.animated ?? null;
    this.name = emoji.name ?? null;
    this.id = emoji.id ?? null;
  }

  get identifier(): string {
    if (this.id) return `${this.animated ? 'a:' : ''}${this.name}:${this.id}`;
    return encodeURIComponent(this.name!);
  }

  imageURL(options: any = {}): string | null {
    if (!this.id) return null;

    const resolvedOptions = { extension: options.extension, size: options.size, animated: undefined as boolean | undefined };

    if (!options.extension || options.extension === 'webp') {
      resolvedOptions.animated = options.animated ?? (this.animated || undefined);
    }

    return (this.client as any).rest.cdn.emoji(this.id, resolvedOptions);
  }

  get createdTimestamp(): number | null {
    return this.id ? DiscordSnowflake.timestampFrom(this.id) : null;
  }

  get createdAt(): Date | null {
    return this.id ? new Date(this.createdTimestamp!) : null;
  }

  override toString(): string {
    return this.id ? formatEmoji({ animated: this.animated as boolean, id: this.id, name: this.name as string }) : this.name!;
  }

  override toJSON(): any {
    const json = super.toJSON({
      guild: 'guildId',
      createdTimestamp: true,
      identifier: true,
    });
    json.imageURL = this.imageURL();
    return json;
  }
}
