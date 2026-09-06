import { channelLink, channelMention } from '@ovencord/formatters';
import { DiscordSnowflake } from '@ovencord/util';
import { type APIChannel, ChannelType, Routes, type Snowflake } from 'discord-api-types/v10';
import type { Client } from '../client/Client.js';
import { ChannelFlagsBitField } from '../util/ChannelFlagsBitField.js';
import { ThreadChannelTypes } from '../util/Constants.js';
import { Base } from './Base.js';
import type { BaseGuildVoiceChannel } from './BaseGuildVoiceChannel.js';
import type { DMChannel } from './DMChannel.js';
import type { GuildChannel } from './GuildChannel.js';
import type { TextBasedChannel } from './interfaces/TextBasedChannel.js';
import type { PartialGroupDMChannel } from './PartialGroupDMChannel.js';
import type { ThreadChannel } from './ThreadChannel.js';
import type { ThreadOnlyChannel } from './ThreadOnlyChannel.js';

/**
 * Represents any channel on Discord.
 *
 * @extends {Base}
 * @abstract
 */
export class BaseChannel extends Base {
	/**
	 * The type of the channel
	 */
	public type: ChannelType;

	/**
	 * The flags that are applied to the channel.
	 */
	public flags: Readonly<ChannelFlagsBitField> | null;

	/**
	 * The channel's id
	 */
	public id: Snowflake;

	/**
	 * The id of the guild this channel belongs to
	 */
	public guildId: Snowflake | null;

	constructor(client: Client, data: APIChannel, immediatePatch = true) {
		super(client);

		this.type = data.type;

		this.guildId = (data as APIChannel & { guild_id?: Snowflake }).guild_id ?? null;

		if (data && immediatePatch) this._patch(data);
	}

	_patch(data: Partial<APIChannel>) {
		if ('flags' in data && data.flags !== undefined) {
			this.flags = new ChannelFlagsBitField(data.flags).freeze();
		} else {
			this.flags ??= new ChannelFlagsBitField().freeze();
		}

		if (data.id) this.id = data.id;
	}

	/**
	 * The timestamp the channel was created at
	 *
	 * @type {number}
	 * @readonly
	 */
	get createdTimestamp() {
		return DiscordSnowflake.timestampFrom(this.id);
	}

	/**
	 * The time the channel was created at
	 *
	 * @type {Date}
	 * @readonly
	 */
	get createdAt() {
		return new Date(this.createdTimestamp);
	}

	/**
	 * The URL to the channel
	 *
	 * @type {string}
	 * @readonly
	 */
	get url(): string {
		return this.isDMBased() ? channelLink(this.id) : channelLink(this.id, this.guildId);
	}

	/**
	 * Whether this Channel is a partial
	 * <info>This is always false outside of DM channels.</info>
	 *
	 * @type {boolean}
	 * @readonly
	 */
	get partial() {
		return false;
	}

	/**
	 * When concatenated with a string, this automatically returns the channel's mention instead of the Channel object.
	 *
	 * @returns {string}
	 * @example
	 * // Logs: Hello from <#123456789012345678>!
	 * console.log(`Hello from ${channel}!`);
	 */
	toString() {
		return channelMention(this.id);
	}

	/**
	 * Deletes this channel.
	 *
	 * @returns {Promise<BaseChannel>}
	 * @example
	 * // Delete the channel
	 * channel.delete()
	 *   .then(console.log)
	 *   .catch(console.error);
	 */
	async delete() {
		await this.client.rest.delete(Routes.channel(this.id));
		return this;
	}

	/**
	 * Fetches this channel.
	 *
	 * @param {boolean} [force=true] Whether to skip the cache check and request the API
	 * @returns {Promise<BaseChannel>}
	 */
	async fetch(force = true) {
		return this.client.channels.fetch(this.id, { force });
	}

	/**
	 * Indicates whether this channel is a {@link ThreadChannel}.
	 *
	 * @returns {boolean}
	 */
	isThread(): this is ThreadChannel {
		return ThreadChannelTypes.includes(this.type);
	}

	/**
	 * Indicates whether this channel is {@link TextBasedChannels text-based}.
	 *
	 * @returns {boolean}
	 */
	isTextBased(): this is BaseChannel & TextBasedChannel {
		return 'messages' in this;
	}

	/**
	 * Indicates whether this channel is DM-based (either a {@link DMChannel} or a {@link PartialGroupDMChannel}).
	 *
	 * @returns {boolean}
	 */
	isDMBased(): this is DMChannel | PartialGroupDMChannel {
		return [ChannelType.DM, ChannelType.GroupDM].includes(this.type);
	}

	/**
	 * Indicates whether this channel is {@link BaseGuildVoiceChannel voice-based}.
	 *
	 * @returns {boolean}
	 */
	isVoiceBased(): this is BaseGuildVoiceChannel {
		return 'bitrate' in this;
	}

	/**
	 * Indicates whether this channel is {@link ThreadOnlyChannel thread-only}.
	 *
	 * @returns {boolean}
	 */
	isThreadOnly(): this is ThreadOnlyChannel {
		return 'availableTags' in this;
	}

	/**
	 * Indicates whether this channel belongs to a guild.
	 *
	 * @returns {boolean}
	 */
	isGuildBased(): this is GuildChannel | ThreadChannel {
		return 'guild' in this && Boolean(this.guildId);
	}

	/**
	 * Indicates whether this channel is sendable.
	 *
	 * @returns {boolean}
	 */
	isSendable() {
		return 'send' in this;
	}

	toJSON(...props: Record<string, boolean | string>[]): Record<string, unknown> {
		return super.toJSON({ createdTimestamp: true }, ...props);
	}
}
