import { lazy } from '@ovencord/util';
import {
	type APIThreadChannel,
	ChannelType,
	PermissionFlagsBits,
	type Snowflake,
	type ThreadAutoArchiveDuration,
} from 'discord-api-types/v10';
import type { Client } from '../client/Client.js';
import { GuildMessageManager } from '../managers/GuildMessageManager.js';
import { ThreadMemberManager } from '../managers/ThreadMemberManager.js';
import { BaseChannel } from './BaseChannel.js';
import type { Guild } from './Guild.js';
import type { GuildMember } from './GuildMember.js';
import { TextBasedChannel } from './interfaces/TextBasedChannel.js';
import type { Message } from './Message.js';
import type { Role } from './Role.js';
import type { User } from './User.js';

const _getThreadOnlyChannel = lazy(() => require('./ThreadOnlyChannel.js').ThreadOnlyChannel);

/**
 * Represents a thread channel on Discord.
 *
 * @extends {BaseChannel}
 * @implements {TextBasedChannel}
 */
export class ThreadChannel extends BaseChannel {
	public guild: Guild;
	public guildId: Snowflake;
	public ownerId: Snowflake | null;
	public messages: GuildMessageManager;
	public members: ThreadMemberManager;
	public name: string;
	public parentId: Snowflake | null;
	public locked: boolean | null;
	public invitable: boolean | null;
	public type: ChannelType = null as unknown as ChannelType;
	public archived: boolean | null;
	public autoArchiveDuration: ThreadAutoArchiveDuration | null;
	public archiveTimestamp: number | null;
	public _createdTimestamp: number | null;
	public lastMessageId: Snowflake | null;
	public lastPinTimestamp: number | null;
	public rateLimitPerUser: number | null;
	public messageCount: number | null;
	public memberCount: number | null;
	public totalMessageSent: number | null;
	public appliedTags: Snowflake[];
	public joined: boolean | null;
	get parent() {
		return this.guild?.channels.resolve(this.parentId as Snowflake);
	}
	constructor(guild: Guild, data: Partial<APIThreadChannel> | Record<string, unknown>, client?: Client) {
		super(guild?.client ?? client, data as any, false);

		/**
		 * The guild the thread is in
		 *
		 * @type {Guild}
		 */
		this.guild = guild;

		/**
		 * The id of the guild the channel is in
		 *
		 * @type {Snowflake}
		 */
		this.guildId = guild?.id ?? (data.guild_id as Snowflake);

		/**
		 * The id of the member who created this thread
		 *
		 * @type {Snowflake}
		 */
		this.ownerId = data.owner_id as Snowflake;

		/**
		 * A manager of the messages sent to this thread
		 *
		 * @type {GuildMessageManager}
		 */
		this.messages = new GuildMessageManager(this, []);

		/**
		 * A manager of the members that are part of this thread
		 *
		 * @type {ThreadMemberManager}
		 */
		this.members = new ThreadMemberManager(this, []);
		this._patch(data as any);
	}

	// ... (skipping unchanged parts)

	/**
	 * Gets the overall set of permissions for a member or role in this thread's parent channel, taking overwrites into
	 * account.
	 *
	 * @param {UserResolvable|RoleResolvable} memberOrRole The member or role to obtain the overall permissions for
	 * @param {boolean} [checkAdmin=true] Whether having the {@link PermissionFlagsBits.Administrator} permission
	 * will return all permissions
	 * @returns {?Readonly<PermissionsBitField>}
	 */
	permissionsFor(memberOrRole: GuildMember | Role | User | string | undefined | null, checkAdmin = true) {
		return this.parent?.permissionsFor(memberOrRole, checkAdmin) ?? null;
	}

	// ...

	get joinable() {
		return (
			!this.archived &&
			!this.joined &&
			this.permissionsFor(this.client.user, true)?.has(
				this.type === ChannelType.PrivateThread ? PermissionFlagsBits.ManageThreads : PermissionFlagsBits.ViewChannel,
				false,
			) === true
		);
	}

	/**
	 * Whether the thread is manageable by the client user, for deleting or editing rateLimitPerUser or locked.
	 *
	 * @type {boolean}
	 * @readonly
	 */
	get manageable() {
		const permissions = this.permissionsFor(this.client.user, true);
		if (!permissions) return false;
		// This flag allows managing even if timed out
		if (permissions.has(PermissionFlagsBits.Administrator, false)) return true;

		return (
			this.guild.members.me.communicationDisabledUntilTimestamp < Date.now() &&
			permissions.has(PermissionFlagsBits.ManageThreads, false)
		);
	}

	/**
	 * Whether the thread is viewable by the client user
	 *
	 * @type {boolean}
	 * @readonly
	 */
	get viewable() {
		const permissions = this.permissionsFor(this.client.user, true);
		if (!permissions) return false;
		return permissions.has(PermissionFlagsBits.ViewChannel, false);
	}

	/**
	 * Whether the client user can send messages in this thread
	 *
	 * @type {boolean}
	 * @readonly
	 */
	get sendable() {
		const permissions = this.permissionsFor(this.client.user, true);
		if (!permissions) return false;
		// This flag allows sending even if timed out
		if (permissions.has(PermissionFlagsBits.Administrator, false)) return true;

		return (
			!(this.archived && this.locked && !this.manageable) &&
			(this.type !== ChannelType.PrivateThread || this.joined || this.manageable) &&
			permissions.has(PermissionFlagsBits.SendMessagesInThreads, false) &&
			this.guild.members.me.communicationDisabledUntilTimestamp < Date.now()
		);
	}

	// ...

	/**
	 * Fetches the message that started this thread, if any.
	 *
	 * The starter message has the same id as the thread itself.
	 *
	 * @param {BaseFetchOptions} [options] Additional options for this fetch
	 * @returns {Promise<Message<true>|null>}
	 */
	async fetchStarterMessage(options: Record<string, unknown> = {}) {
		try {
			return await this.messages.fetch({
				message: this.id,
				force: (options.force as boolean) ?? true,
				cache: options.cache as boolean,
			});
		} catch {
			return null;
		}
	}

	/**
	 * Deletes this thread.
	 *
	 * @param {string} [reason] Reason for deleting this thread
	 * @returns {Promise<ThreadChannel>}
	 * @example
	 * // Delete the thread
	 * thread.delete('cleaning out old threads')
	 *   .then(deletedThread => console.log(deletedThread))
	 *   .catch(console.error);
	 */
	async delete(reason?: string) {
		await this.guild.channels.delete(this.id, reason);
		return this;
	}

	// These are here only for documentation purposes - they are implemented by TextBasedChannel

	get lastMessage(): Message | null {
		return null;
	}

	get lastPinAt(): Date | null {
		return null;
	}

	send(_options: unknown): Promise<unknown> {
		return Promise.resolve(null as unknown);
	}

	sendTyping(): Promise<void> {
		return Promise.resolve();
	}

	createMessageCollector(_options?: Record<string, unknown>): unknown {
		return null;
	}

	awaitMessages(_options?: Record<string, unknown>): Promise<unknown> {
		return Promise.resolve(null);
	}

	createMessageComponentCollector(_options?: Record<string, unknown>): unknown {
		return null;
	}

	awaitMessageComponent(_options?: Record<string, unknown>): Promise<unknown> {
		return Promise.resolve(null);
	}

	bulkDelete(
		_messages: number | Iterable<Message | string> | readonly (Message | string)[],
		_filterOld?: boolean,
	): Promise<unknown> {
		return Promise.resolve(null);
	}
	// Doesn't work on Thread channels; setRateLimitPerUser() {}
	// Doesn't work on Thread channels; setNSFW() {}
}

TextBasedChannel.applyToClass(ThreadChannel, ['fetchWebhooks', 'setRateLimitPerUser', 'setNSFW'] as never[]);
