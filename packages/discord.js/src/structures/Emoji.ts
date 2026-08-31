import { formatEmoji } from '@ovencord/formatters';
import type { EmojiURLOptions } from '@ovencord/rest';
import { DiscordSnowflake } from '@ovencord/util';
import type { APIEmoji, APIMessageComponentEmoji, APIPartialEmoji, Snowflake } from 'discord-api-types/v10';
import type { Client } from '../client/Client.js';
import { Base } from './Base.js';

/**
 * Represents an emoji, see {@link ApplicationEmoji}, {@link GuildEmoji} and {@link ReactionEmoji}.
 *
 * @extends {Base}
 */
export class Emoji extends Base {
	public animated: boolean | null;
	public name: string | null;
	public id: Snowflake | null;

	constructor(client: Client, emoji: APIEmoji | APIPartialEmoji | APIMessageComponentEmoji) {
		super(client);
		this.animated = emoji.animated ?? null;
		this.name = emoji.name ?? null;
		this.id = (emoji.id as Snowflake) ?? null;
	}

	get identifier(): string {
		if (this.id) return `${this.animated ? 'a:' : ''}${this.name}:${this.id}`;
		return this.name ? encodeURIComponent(this.name) : '';
	}

	imageURL(options: EmojiURLOptions = {}): string | null {
		if (!this.id) return null;

		const resolvedOptions: { extension?: string; size?: number; animated?: boolean } = {
			extension: options.extension,
			size: options.size,
			animated: undefined,
		};

		if (!options.extension || options.extension === 'webp') {
			resolvedOptions.animated =
				(options as unknown as { animated?: boolean }).animated ?? (this.animated || undefined);
		}

		return (this.client as unknown as { rest: { cdn: { emoji: Function } } }).rest.cdn.emoji(this.id, resolvedOptions);
	}

	get createdTimestamp(): number | null {
		return this.id ? DiscordSnowflake.timestampFrom(this.id) : null;
	}

	get createdAt(): Date | null {
		const timestamp = this.createdTimestamp;
		return timestamp ? new Date(timestamp) : null;
	}

	override toString(): string {
		return this.id
			? formatEmoji({ animated: this.animated as boolean, id: this.id, name: this.name as string })
			: (this.name ?? '');
	}

	override toJSON(): Record<string, unknown> {
		const json = super.toJSON({
			guild: 'guildId',
			createdTimestamp: true,
			identifier: true,
		});
		json.imageURL = this.imageURL();
		return json;
	}
}
