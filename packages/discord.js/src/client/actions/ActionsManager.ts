import { Action } from './Action.js';
import { ChannelCreateAction } from './ChannelCreate.js';
import { ChannelDeleteAction } from './ChannelDelete.js';
import { ChannelUpdateAction } from './ChannelUpdate.js';
import { GuildChannelsPositionUpdateAction } from './GuildChannelsPositionUpdate.js';
import { GuildEmojiCreateAction } from './GuildEmojiCreate.js';
import { GuildEmojiDeleteAction } from './GuildEmojiDelete.js';
import { GuildEmojiUpdateAction } from './GuildEmojiUpdate.js';
import { GuildEmojisUpdateAction } from './GuildEmojisUpdate.js';
import { GuildMemberRemoveAction } from './GuildMemberRemove.js';
import { GuildMemberUpdateAction } from './GuildMemberUpdate.js';
import { GuildRoleCreateAction } from './GuildRoleCreate.js';
import { GuildRoleDeleteAction } from './GuildRoleDelete.js';
import { GuildRolesPositionUpdateAction } from './GuildRolesPositionUpdate.js';
import { GuildScheduledEventDeleteAction } from './GuildScheduledEventDelete.js';
import { GuildScheduledEventUserAddAction } from './GuildScheduledEventUserAdd.js';
import { GuildScheduledEventUserRemoveAction } from './GuildScheduledEventUserRemove.js';
import { GuildSoundboardSoundDeleteAction } from './GuildSoundboardSoundDelete.js';
import { GuildStickerCreateAction } from './GuildStickerCreate.js';
import { GuildStickerDeleteAction } from './GuildStickerDelete.js';
import { GuildStickerUpdateAction } from './GuildStickerUpdate.js';
import { GuildStickersUpdateAction } from './GuildStickersUpdate.js';
import { GuildUpdateAction } from './GuildUpdate.js';
import { InteractionCreateAction } from './InteractionCreate.js';
import { MessageCreateAction } from './MessageCreate.js';
import { MessageDeleteAction } from './MessageDelete.js';
import { MessageDeleteBulkAction } from './MessageDeleteBulk.js';
import { MessagePollVoteAddAction } from './MessagePollVoteAdd.js';
import { MessagePollVoteRemoveAction } from './MessagePollVoteRemove.js';
import { MessageReactionAddAction } from './MessageReactionAdd.js';
import { MessageReactionRemoveAction } from './MessageReactionRemove.js';
import { MessageReactionRemoveAllAction } from './MessageReactionRemoveAll.js';
import { MessageReactionRemoveEmojiAction } from './MessageReactionRemoveEmoji.js';
import { MessageUpdateAction } from './MessageUpdate.js';
import { StageInstanceCreateAction } from './StageInstanceCreate.js';
import { StageInstanceDeleteAction } from './StageInstanceDelete.js';
import { StageInstanceUpdateAction } from './StageInstanceUpdate.js';
import { ThreadCreateAction } from './ThreadCreate.js';
import { ThreadMembersUpdateAction } from './ThreadMembersUpdate.js';
import { TypingStartAction } from './TypingStart.js';
import { UserUpdateAction } from './UserUpdate.js';

export class ActionsManager {
  public client: any;
  public ChannelCreate: ChannelCreateAction;

  public ChannelDelete: ChannelDeleteAction;
  public ChannelUpdate: ChannelUpdateAction;
  public GuildChannelsPositionUpdate: GuildChannelsPositionUpdateAction;
  public GuildEmojiCreate: GuildEmojiCreateAction;
  public GuildEmojiDelete: GuildEmojiDeleteAction;
  public GuildEmojiUpdate: GuildEmojiUpdateAction;
  public GuildEmojisUpdate: GuildEmojisUpdateAction;
  public GuildMemberRemove: GuildMemberRemoveAction;
  public GuildMemberUpdate: GuildMemberUpdateAction;
  public GuildRoleCreate: GuildRoleCreateAction;
  public GuildRoleDelete: GuildRoleDeleteAction;
  public GuildRolesPositionUpdate: GuildRolesPositionUpdateAction;
  public GuildScheduledEventDelete: GuildScheduledEventDeleteAction;
  public GuildScheduledEventUserAdd: GuildScheduledEventUserAddAction;
  public GuildScheduledEventUserRemove: GuildScheduledEventUserRemoveAction;
  public GuildSoundboardSoundDelete: GuildSoundboardSoundDeleteAction;
  public GuildStickerCreate: GuildStickerCreateAction;
  public GuildStickerDelete: GuildStickerDeleteAction;
  public GuildStickerUpdate: GuildStickerUpdateAction;
  public GuildStickersUpdate: GuildStickersUpdateAction;
  public GuildUpdate: GuildUpdateAction;
  public InteractionCreate: InteractionCreateAction;
  public MessageCreate: MessageCreateAction;
  public MessageDelete: MessageDeleteAction;
  public MessageDeleteBulk: MessageDeleteBulkAction;
  public MessagePollVoteAdd: MessagePollVoteAddAction;
  public MessagePollVoteRemove: MessagePollVoteRemoveAction;
  public MessageReactionAdd: MessageReactionAddAction;
  public MessageReactionRemove: MessageReactionRemoveAction;
  public MessageReactionRemoveAll: MessageReactionRemoveAllAction;
  public MessageReactionRemoveEmoji: MessageReactionRemoveEmojiAction;
  public MessageUpdate: MessageUpdateAction;
  public StageInstanceCreate: StageInstanceCreateAction;
  public StageInstanceDelete: StageInstanceDeleteAction;
  public StageInstanceUpdate: StageInstanceUpdateAction;
  public ThreadCreate: ThreadCreateAction;
  public ThreadMembersUpdate: ThreadMembersUpdateAction;
  public TypingStart: TypingStartAction;
  public UserUpdate: UserUpdateAction;
  // These symbols represent fully built data that we inject at times when calling actions manually.
  // Action#getUser, for example, will return the injected data (which is assumed to be a built structure)
  // instead of trying to make it from provided data
  injectedUser = Symbol('djs.actions.injectedUser');

  injectedChannel = Symbol('djs.actions.injectedChannel');

  injectedMessage = Symbol('djs.actions.injectedMessage');

  constructor(client: any) {
    this.client = client;

    this.ChannelCreate = new ChannelCreateAction(this.client);
    this.ChannelDelete = new ChannelDeleteAction(this.client);
    this.ChannelUpdate = new ChannelUpdateAction(this.client);
    this.GuildChannelsPositionUpdate = new GuildChannelsPositionUpdateAction(this.client);
    this.GuildEmojiCreate = new GuildEmojiCreateAction(this.client);
    this.GuildEmojiDelete = new GuildEmojiDeleteAction(this.client);
    this.GuildEmojiUpdate = new GuildEmojiUpdateAction(this.client);
    this.GuildEmojisUpdate = new GuildEmojisUpdateAction(this.client);
    this.GuildMemberRemove = new GuildMemberRemoveAction(this.client);
    this.GuildMemberUpdate = new GuildMemberUpdateAction(this.client);
    this.GuildRoleCreate = new GuildRoleCreateAction(this.client);
    this.GuildRoleDelete = new GuildRoleDeleteAction(this.client);
    this.GuildRolesPositionUpdate = new GuildRolesPositionUpdateAction(this.client);
    this.GuildScheduledEventDelete = new GuildScheduledEventDeleteAction(this.client);
    this.GuildScheduledEventUserAdd = new GuildScheduledEventUserAddAction(this.client);
    this.GuildScheduledEventUserRemove = new GuildScheduledEventUserRemoveAction(this.client);
    this.GuildSoundboardSoundDelete = new GuildSoundboardSoundDeleteAction(this.client);
    this.GuildStickerCreate = new GuildStickerCreateAction(this.client);
    this.GuildStickerDelete = new GuildStickerDeleteAction(this.client);
    this.GuildStickerUpdate = new GuildStickerUpdateAction(this.client);
    this.GuildStickersUpdate = new GuildStickersUpdateAction(this.client);
    this.GuildUpdate = new GuildUpdateAction(this.client);
    this.InteractionCreate = new InteractionCreateAction(this.client);
    this.MessageCreate = new MessageCreateAction(this.client);
    this.MessageDelete = new MessageDeleteAction(this.client);
    this.MessageDeleteBulk = new MessageDeleteBulkAction(this.client);
    this.MessagePollVoteAdd = new MessagePollVoteAddAction(this.client);
    this.MessagePollVoteRemove = new MessagePollVoteRemoveAction(this.client);
    this.MessageReactionAdd = new MessageReactionAddAction(this.client);
    this.MessageReactionRemove = new MessageReactionRemoveAction(this.client);
    this.MessageReactionRemoveAll = new MessageReactionRemoveAllAction(this.client);
    this.MessageReactionRemoveEmoji = new MessageReactionRemoveEmojiAction(this.client);
    this.MessageUpdate = new MessageUpdateAction(this.client);
    this.StageInstanceCreate = new StageInstanceCreateAction(this.client);
    this.StageInstanceDelete = new StageInstanceDeleteAction(this.client);
    this.StageInstanceUpdate = new StageInstanceUpdateAction(this.client);
    this.ThreadCreate = new ThreadCreateAction(this.client);
    this.ThreadMembersUpdate = new ThreadMembersUpdateAction(this.client);
    this.TypingStart = new TypingStartAction(this.client);
    this.UserUpdate = new UserUpdateAction(this.client);
  }
}
