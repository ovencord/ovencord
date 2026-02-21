import { lazy  } from '@ovencord/util';
import { ChannelFlags, ChannelType, PermissionFlagsBits, Routes  } from 'discord-api-types/v10';
import { DiscordjsRangeError, ErrorCodes  } from '../errors/index.js';
import { GuildMessageManager  } from '../managers/GuildMessageManager.js';
import { ThreadMemberManager  } from '../managers/ThreadMemberManager.js';
import { ChannelFlagsBitField  } from '../util/ChannelFlagsBitField.js';
import { BaseChannel  } from './BaseChannel.js';
import { TextBasedChannel  } from './interfaces/TextBasedChannel.js';

const getThreadOnlyChannel = lazy(() => require('./ThreadOnlyChannel.js').ThreadOnlyChannel);

/**
 * Represents a thread channel on Discord.
 *
 * @extends {BaseChannel}
 * @implements {TextBasedChannel}
 */
export class ThreadChannel extends BaseChannel {
  public guild: any;
  public guildId: any;
  public ownerId: any;
  public messages: any;
  public members: any;
  public name: any;
  public parentId: any;
  public locked: any;
  public invitable: any;
  public type: any = null;
  public archived: any;
  public autoArchiveDuration: any;
  public archiveTimestamp: any;
  public _createdTimestamp: any;
  public lastMessageId: any;
  public lastPinTimestamp: any;
  public rateLimitPerUser: any;
  public messageCount: any;
  public memberCount: any;
  public totalMessageSent: any;
  public appliedTags: any;
  public joined: any;
  get parent() {
    return this.guild?.channels.resolve(this.parentId);
  }
  constructor(guild: any, data: any, client: any) {
    super(guild?.client ?? client, data, false);

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
    this.guildId = guild?.id ?? data.guild_id;

    /**
     * The id of the member who created this thread
     *
     * @type {Snowflake}
     */
    this.ownerId = data.owner_id;

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
    this._patch(data);
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
  permissionsFor(memberOrRole: any, checkAdmin = true) {
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
  async fetchStarterMessage(options = {}) {
    try {
      // @ts-ignore
      return await this.messages.fetch({ message: this.id, force: options.force ?? true, cache: options.cache });
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

  /* eslint-disable getter-return */
  get lastMessage(): any { return null; }

  get lastPinAt(): any { return null; }

  send(): any { return null; }

  sendTyping() {}

  createMessageCollector() {}

  awaitMessages() {}

  createMessageComponentCollector() {}

  awaitMessageComponent() {}

  bulkDelete() {}
  // Doesn't work on Thread channels; setRateLimitPerUser() {}
  // Doesn't work on Thread channels; setNSFW() {}
}

TextBasedChannel.applyToClass(ThreadChannel, ['fetchWebhooks', 'setRateLimitPerUser', 'setNSFW'] as any);
