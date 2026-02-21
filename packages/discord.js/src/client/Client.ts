import { Collection  } from '@ovencord/collection';
import { REST, RESTEvents, makeURLSearchParams  } from '@ovencord/rest';
import { WebSocketManager, WebSocketShardEvents, WebSocketShardStatus  } from '@ovencord/ws';
import { AsyncEventEmitter  } from '../util/AsyncEventEmitter.js';
import { GatewayDispatchEvents, GatewayIntentBits, OAuth2Scopes, Routes, type Snowflake  } from 'discord-api-types/v10';
import { DiscordjsError, DiscordjsTypeError, ErrorCodes  } from '../errors/index.js';
import { ChannelManager  } from '../managers/ChannelManager.js';
import { GuildManager } from '../managers/GuildManager.js';
import { UserManager  } from '../managers/UserManager.js';
import { ShardClientUtil  } from '../sharding/ShardClientUtil.js';
import { ClientPresence  } from '../structures/ClientPresence.js';
import { GuildPreview  } from '../structures/GuildPreview.js';
import { GuildTemplate  } from '../structures/GuildTemplate.js';
import { SoundboardSound  } from '../structures/SoundboardSound.js';
import { Sticker  } from '../structures/Sticker.js';
import { StickerPack  } from '../structures/StickerPack.js';
import { VoiceRegion  } from '../structures/VoiceRegion.js';
import { Webhook  } from '../structures/Webhook.js';
import { Widget  } from '../structures/Widget.js';
import { resolveInviteCode, resolveGuildTemplateCode  } from '../util/DataResolver.js';
import { Events  } from '../util/Events.js';
import { IntentsBitField  } from '../util/IntentsBitField.js';
import { createInvite  } from '../util/Invites.js';
import { Options  } from '../util/Options.js';
import { PermissionsBitField } from '../util/PermissionsBitField.js';
import { Status  } from '../util/Status.js';
import { Sweepers  } from '../util/Sweepers.js';
import { flatten  } from '../util/Util.js';

import { ActionsManager } from './actions/ActionsManager.js';
import { ClientVoiceManager } from './voice/ClientVoiceManager.js';
import { PacketHandlers } from './websocket/handlers/index.js';
import { ClientUser } from '../structures/ClientUser.js';
import { ClientApplication } from '../structures/ClientApplication.js';

const WaitingForGuildEvents = [GatewayDispatchEvents.GuildCreate, GatewayDispatchEvents.GuildDelete];
const BeforeReadyWhitelist = [
  GatewayDispatchEvents.Ready,
  GatewayDispatchEvents.Resumed,
  GatewayDispatchEvents.GuildCreate,
  GatewayDispatchEvents.GuildDelete,
  GatewayDispatchEvents.GuildMembersChunk,
  GatewayDispatchEvents.GuildMemberAdd,
  GatewayDispatchEvents.GuildMemberRemove,
];

export type GuildResolvable = any;
export type PermissionResolvable = any;

/**
 * The main hub for interacting with the Discord API, and the starting point for any bot.
 *
 * @extends {AsyncEventEmitter}
 */
export interface WebhookDeleteOptions {
  /** Token of the webhook */
  token?: string;
  /** The reason for deleting the webhook */
  reason?: string;
}

export interface ClientFetchInviteOptions {
  /** Whether to include approximate member counts */
  withCounts?: boolean;
  /** The id of the guild scheduled event to include with the invite */
  guildScheduledEventId?: string;
}

export interface StickerPackFetchOptions {
  /** The id of the sticker pack to fetch */
  packId?: string;
}

export interface InviteGenerationOptions {
  /** Scopes that should be requested */
  scopes: OAuth2Scopes[];
  /** Permissions to request */
  permissions?: PermissionResolvable;
  /** Guild to preselect */
  guild?: GuildResolvable;
  /** Whether to disable the guild selection */
  disableGuildSelect?: boolean;
}

export class Client extends AsyncEventEmitter {
  public status: any;
  public readyTimeout: any;
  public options: any;
  public rest: REST;
  public presence: ClientPresence;
  public actions: ActionsManager;
  public users: UserManager;
  public guilds: GuildManager;
  public channels: ChannelManager;
  public sweepers: Sweepers;
  public ws: WebSocketManager;
  public shard: ShardClientUtil | null;
  public voice: ClientVoiceManager;
  public user: ClientUser | null;
  public application: ClientApplication | null;
  public pings: Collection<number, number>;
  public lastPingTimestamps: Collection<number, number>;
  public readyTimestamp: number | null;
  public token: string | null;
  public expectedGuilds: Set<string>;
  public incomingPacketQueue: any[];

  /**
   * @param {any} options Options for the client
   */
  constructor(options: any) {
    super();
    this.token = null;

    if (typeof options !== 'object' || options === null) {
      throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'options', 'object', true);
    }

    const defaultOptions = Options.createDefault();
    /**
     * The options the client was instantiated with
     *
     * @type {ClientOptions}
     */
    this.options = {
      ...defaultOptions,
      ...options,
      presence: {
        ...defaultOptions.presence,
        ...options.presence,
      },
      sweepers: {
        ...defaultOptions.sweepers,
        ...options.sweepers,
      },
      ws: {
        ...defaultOptions.ws,
        ...options.ws,
      },
      rest: {
        ...defaultOptions.rest,
        ...options.rest,
        userAgentAppendix: options.rest?.userAgentAppendix
          ? `${Options.userAgentAppendix} ${options.rest.userAgentAppendix}`
          : Options.userAgentAppendix,
      },
    };

    /**
     * The REST manager of the client
     *
     * @type {REST}
     */
    this.rest = new REST(this.options.rest);

    this.rest.on(RESTEvents.Debug, message => this.emit(Events.Debug, message));

    // In Bun, Worker env vars and Bun.spawn env vars populate process.env directly
    const data = process.env;

    if (this.options.ws.shardIds === defaultOptions.ws.shardIds && 'SHARDS' in data && data.SHARDS) {
      const shards = JSON.parse(data.SHARDS);
      this.options.ws.shardIds = Array.isArray(shards) ? shards : [shards];
    }

    if (this.options.ws.shardCount === defaultOptions.ws.shardCount && 'SHARD_COUNT' in data) {
      this.options.ws.shardCount = Number(data.SHARD_COUNT);
    }

    /**
     * The presence of the Client
     *
     * @private
     * @type {ClientPresence}
     */
    this.presence = new ClientPresence(this, this.options.ws.initialPresence ?? this.options.presence);

    this.ws = new WebSocketManager(this as any);
    this.actions = new ActionsManager(this);
    this.voice = new ClientVoiceManager(this);
    this.shard =
      !process.env.SHARDING_MANAGER && !process.env.DISCORD_HYBRID_SHARDING
        ? null
        : ShardClientUtil.singleton(this, process.env.SHARDING_MANAGER_MODE as any);
    this.users = new UserManager(this, undefined as any);
    this.guilds = new GuildManager(this, undefined as any);
    this.channels = new ChannelManager(this, undefined as any);
    this.sweepers = new Sweepers(this, this.options.sweepers);

    this._validateOptions();

    /**
     * The current status of this Client
     *
     * @type {Status}
     * @private
     */
    this.status = Status.Idle;

    this.expectedGuilds = new Set();

    /**
     * The ready timeout
     *
     * @name Client#readyTimeout
     * @type {?NodeJS.Timeout}
     * @private
     */
    this.readyTimeout = null;



    Object.defineProperty(this, 'token', { writable: true });
    if (!this.token && 'DISCORD_TOKEN' in process.env) {
      /**
       * Authorization token for the logged in bot.
       * If present, this defaults to `process.env.DISCORD_TOKEN` when instantiating the client
       * <warn>This should be kept private at all times.</warn>
       *
       * @type {?string}
       */
      this.token = process.env.DISCORD_TOKEN ?? null;
    } else if (this.options.ws.token) {
      this.token = this.options.ws.token;
    } else {
      this.token = null;
    }

    const wsOptions = {
      ...this.options.ws,
      intents: this.options.intents.bitfield,
      fetchGatewayInformation: () => this.rest.get(Routes.gatewayBot()),
      // Explicitly nulled to always be set using `setToken` in `login`
      token: null,
    };

    /**
     * The WebSocket manager of the client
     *
     * @type {WebSocketManager}
     */
    this.ws = new WebSocketManager(wsOptions);

    /**
     * Shard helpers for the client (only if the process was spawned from a {@link ShardingManager})
     *
     * @type {?ShardClientUtil}
     */
    this.shard = process.env.SHARDING_MANAGER
      ? ShardClientUtil.singleton(this, process.env.SHARDING_MANAGER_MODE)
      : null;

    /**
     * The voice manager of the client
     *
     * @type {ClientVoiceManager}
     */
    this.voice = new ClientVoiceManager(this);

    /**
     * User that the client is logged in as
     *
     * @type {?ClientUser}
     */
    this.user = null;

    /**
     * The application of this bot
     *
     * @type {?ClientApplication}
     */
    this.application = null;

    /**
     * The latencies of the WebSocketShard connections
     *
     * @type {Collection<number, number>}
     */
    this.pings = new Collection();

    /**
     * The last time a ping was sent (a timestamp) for each WebSocketShard connection
     *
     * @type {Collection<number, number>}
     */
    this.lastPingTimestamps = new Collection();

    /**
     * Timestamp of the time the client was last {@link Status.Ready} at
     *
     * @type {?number}
     */
    this.readyTimestamp = null;

    /**
     * An array of queued events before this Client became ready
     *
     * @type {Object[]}
     * @private
     * @name Client#incomingPacketQueue
     */
    this.readyTimestamp = null;
    this.incomingPacketQueue = [];

    this._attachEvents();
  }

  /**
   * Time at which the client was last regarded as being in the {@link Status.Ready} state
   * (each time the client disconnects and successfully reconnects, this will be overwritten)
   *
   * @type {?Date}
   * @readonly
   */
  get readyAt() {
    return this.readyTimestamp && new Date(this.readyTimestamp);
  }

  /**
   * How long it has been since the client last entered the {@link Status.Ready} state in milliseconds
   *
   * @type {?number}
   * @readonly
   */
  get uptime() {
    return this.readyTimestamp && Date.now() - this.readyTimestamp;
  }

  /**
   * Logs the client in, establishing a WebSocket connection to Discord.
   *
   * @param {string} [token=this.token] Token of the account to log in with
   * @returns {Promise<string>} Token of the account used
   * @example
   * client.login('my token');
   */
  public async login(token: string | null = this.token): Promise<string> {
    if (!token || typeof token !== 'string') throw new DiscordjsError(ErrorCodes.TokenInvalid);
    this.token = token.replace(/^bot\s*/i, '');

    this.rest.setToken(this.token);

    this.emit(Events.Debug, `Provided token: ${this._censoredToken}`);
    this.emit(Events.Debug, 'Preparing to connect to the gateway...');

    this.ws.setToken(this.token);

    try {
      await this.ws.connect();
      return this.token;
    } catch (error) {
      await this.destroy();
      throw error;
    }
  }

  /**
   * Checks if the client can be marked as ready
   *
   * @private
   */
  async _checkReady() {
    // Step 0. Clear the ready timeout, if it exists
    if (this.readyTimeout) {
      clearTimeout(this.readyTimeout);
      this.readyTimeout = null;
    }

    // Step 1. If we don't have any other guilds pending, we are ready
    if (
      !this.expectedGuilds.size &&
      (await this.ws.fetchStatus()).every(status => status === WebSocketShardStatus.Ready)
    ) {
      this.emit(Events.Debug, 'Client received all its guilds. Marking as fully ready.');

      this._triggerClientReady();
      return;
    }

    const hasGuildsIntent = this.options.intents.has(GatewayIntentBits.Guilds);
    // Step 2. Create a timeout that will mark the client as ready if there are still unavailable guilds
    // * The timeout is 15 seconds by default
    // * This can be optionally changed in the client options via the `waitGuildTimeout` option
    // * a timeout time of zero will skip this timeout, which potentially could cause the Client to miss guilds.

    this.readyTimeout = setTimeout(
      () => {
        this.emit(
          Events.Debug,
          `${
            hasGuildsIntent
              ? `Client did not receive any guild packets in ${this.options.waitGuildTimeout} ms.`
              : 'Client will not receive anymore guild packets.'
          }\nUnavailable guild count: ${this.expectedGuilds.size}`,
        );

        this.readyTimeout = null;

        this._triggerClientReady();
      },
      hasGuildsIntent ? this.options.waitGuildTimeout : 0,
    ).unref();
  }

  /**
   * Attaches event handlers to the WebSocketShardManager from `@ovencord/ws`.
   *
   * @private
   */
  _attachEvents() {
    this.ws.on(WebSocketShardEvents.Debug, (message: string, shardId: number) =>
      this.emit(Events.Debug, `[WS => ${typeof shardId === 'number' ? `Shard ${shardId}` : 'Manager'}] ${message}`),
    );
    this.ws.on(WebSocketShardEvents.Dispatch, this._handlePacket.bind(this));

    this.ws.on(WebSocketShardEvents.HeartbeatComplete, ({ heartbeatAt, latency }: { heartbeatAt: number; latency: number }, shardId: number) => {
      this.emit(Events.Debug, `[WS => Shard ${shardId}] Heartbeat acknowledged, latency of ${latency}ms.`);
      this.lastPingTimestamps.set(shardId, heartbeatAt);
      this.pings.set(shardId, latency);
    });
  }

  /**
   * Processes a packet and queues it if this WebSocketManager is not ready.
   *
   * @param {GatewayDispatchPayload} packet The packet to be handled
   * @param {number} shardId The shardId that received this packet
   * @private
   */
  async _handlePacket(packet: any, shardId: number) {
    // Emit raw packet for connectors (Bunraku/Shoukaku) that need VOICE_SERVER_UPDATE / VOICE_STATE_UPDATE
    this.emit('raw', packet);

    if (this.status !== Status.Ready && !BeforeReadyWhitelist.includes(packet.t)) {
      this.incomingPacketQueue.push({ packet, shardId });
    } else {
      if (this.incomingPacketQueue.length) {
        const item = this.incomingPacketQueue.shift();
        setImmediate(async () => {
          await this._handlePacket(item.packet, item.shardId);
        }).unref();
      }

      const handler = PacketHandlers[packet.t];
      if (handler) {
        handler(this, packet, shardId);
      }

      if (packet.t === GatewayDispatchEvents.Ready) {
        await this._checkReady();
      } else if (this.status === Status.WaitingForGuilds && WaitingForGuildEvents.includes(packet.t)) {
        this.expectedGuilds.delete(packet.d.id);
        await this._checkReady();
      }
    }
  }

  get intents() {
    return new IntentsBitField(this.options.intents);
  }

  async fetchGatewayInformation() {
    return this.rest.get(Routes.gatewayBot());
  }

  /**
   * Broadcasts a packet to every shard of this client handles.
   *
   * @param {Object} packet The packet to send
   * @private
   */
  async _broadcast(packet: any) {
    const shardIds = await this.ws.getShardIds();
    return Promise.all(shardIds.map(shardId => this.ws.send(shardId, packet)));
  }

  /**
   * Causes the client to be marked as ready and emits the ready event.
   *
   * @private
   */
  _triggerClientReady() {
    this.status = Status.Ready;

    this.readyTimestamp = Date.now();

    /**
     * Emitted when the client becomes ready to start working.
     *
     * @event Client#clientReady
     * @param {Client} client The client
     */
    this.emit(Events.ClientReady, this);
  }

  /**
   * Returns whether the client has logged in, indicative of being able to access
   * properties such as `user` and `application`.
   *
   * @returns {boolean}
   */
  isReady() {
    return this.status === Status.Ready;
  }

  /**
   * The average ping of all WebSocketShards
   *
   * @type {?number}
   * @readonly
   */
  get ping() {
    return this.pings.size ? this.pings.reduce((a, b) => a + b, 0) / this.pings.size : null;
  }



  /**
   * Deletes a webhook.
   *
   * @param {Snowflake} id The webhook's id
   * @param {WebhookDeleteOptions} [options] Options for deleting the webhook
   * @returns {Promise<void>}
   */
  async deleteWebhook(id: string, { token, reason }: WebhookDeleteOptions = {}) {
    await this.rest.delete(Routes.webhook(id, token), { auth: !token, reason });
  }

  /**
   * Increments max listeners by one, if they are not zero.
   *
   * @private
   */
  incrementMaxListeners() {
    const maxListeners = this.getMaxListeners();
    if (maxListeners !== 0) {
      this.setMaxListeners(maxListeners + 1);
    }
  }

  /**
   * Decrements max listeners by one, if they are not zero.
   *
   * @private
   */
  decrementMaxListeners() {
    const maxListeners = this.getMaxListeners();
    if (maxListeners !== 0) {
      this.setMaxListeners(maxListeners - 1);
    }
  }

  /**
   * Destroys all assets used by the client.
   *
   * @returns {Promise<void>}
   */
  async destroy() {
    this.rest.clearHashSweeper();
    this.rest.clearHandlerSweeper();

    this.sweepers.destroy();
    await this.ws.destroy();
    this.token = null;
    this.rest.setToken(null as any);
  }



  /**
   * Obtains an invite from Discord.
   *
   * @param {InviteResolvable} invite Invite code or URL
   * @param {ClientFetchInviteOptions} [options] Options for fetching the invite
   * @returns {Promise<Invite>}
   * @example
   * client.fetchInvite('https://discord.gg/djs')
   *   .then(invite => console.log(`Obtained invite with code: ${invite.code}`))
   *   .catch(console.error);
   */
  async fetchInvite(invite, { withCounts, guildScheduledEventId }: ClientFetchInviteOptions = {}: any) {
    const code = resolveInviteCode(invite);

    const query = makeURLSearchParams({
      with_counts: withCounts,
      guild_scheduled_event_id: guildScheduledEventId,
    });

    const data = await this.rest.get(Routes.invite(code), { query });
    return createInvite(this, data);
  }

  /**
   * Obtains a template from Discord.
   *
   * @param {GuildTemplateResolvable} template Template code or URL
   * @returns {Promise<GuildTemplate>}
   * @example
   * client.fetchGuildTemplate('https://discord.new/FKvmczH2HyUf')
   *   .then(template => console.log(`Obtained template with code: ${template.code}`))
   *   .catch(console.error);
   */
  async fetchGuildTemplate(template: string) {
    const code = resolveGuildTemplateCode(template);
    const data = await this.rest.get(Routes.template(code));
    return new GuildTemplate(this, data);
  }

  /**
   * Obtains a webhook from Discord.
   *
   * @param {Snowflake} id The webhook's id
   * @param {string} [token] Token for the webhook
   * @returns {Promise<Webhook>}
   * @example
   * client.fetchWebhook('id', 'token')
   *   .then(webhook => console.log(`Obtained webhook with name: ${webhook.name}`))
   *   .catch(console.error);
   */
  async fetchWebhook(id: string, token?: string) {
    const data = await this.rest.get(Routes.webhook(id, token), { auth: token === undefined }) as any;
    return new Webhook(this, { token, ...data });
  }

  /**
   * Obtains the available voice regions from Discord.
   *
   * @returns {Promise<Collection<string, VoiceRegion>>}
   * @example
   * client.fetchVoiceRegions()
   *   .then(regions => console.log(`Available regions are: ${regions.map(region => region.name).join(', ')}`))
   *   .catch(console.error);
   */
  async fetchVoiceRegions() {
    const apiRegions = await this.rest.get(Routes.voiceRegions()) as any[];
    const regions = new Collection();
    for (const region of apiRegions) regions.set(region.id, new VoiceRegion(region));
    return regions;
  }

  /**
   * Obtains a sticker from Discord.
   *
   * @param {Snowflake} id The sticker's id
   * @returns {Promise<Sticker>}
   * @example
   * client.fetchSticker('id')
   *   .then(sticker => console.log(`Obtained sticker with name: ${sticker.name}`))
   *   .catch(console.error);
   */
  async fetchSticker(id: string) {
    const data = await this.rest.get(Routes.sticker(id));
    return new Sticker(this, data);
  }



  /**
   * Obtains the list of available sticker packs.
   *
   * @param {StickerPackFetchOptions} [options={}] Options for fetching sticker packs
   * @returns {Promise<Collection<Snowflake, StickerPack>|StickerPack>}
   * A collection of sticker packs, or a single sticker pack if a packId was provided
   * @example
   * client.fetchStickerPacks()
   *   .then(packs => console.log(`Available sticker packs are: ${packs.map(pack => pack.name).join(', ')}`))
   *   .catch(console.error);
   * @example
   * client.fetchStickerPacks({ packId: '751604115435421716' })
   *   .then(pack => console.log(`Sticker pack name: ${pack.name}`))
   *   .catch(console.error);
   */
  async fetchStickerPacks({ packId }: StickerPackFetchOptions = {}) {
    if (packId) {
      const innerData = await this.rest.get(Routes.stickerPack(packId)) as any;
      return new StickerPack(this, innerData);
    }

    const data = await this.rest.get(Routes.stickerPacks()) as any;
    return new Collection(data.sticker_packs.map((stickerPack: any) => [stickerPack.id, new StickerPack(this, stickerPack)]));
  }

  /**
   * Obtains the list of default soundboard sounds.
   *
   * @returns {Promise<Collection<string, SoundboardSound>>}
   * @example
   * client.fetchDefaultSoundboardSounds()
   *  .then(sounds => console.log(`Available soundboard sounds are: ${sounds.map(sound => sound.name).join(', ')}`))
   *  .catch(console.error);
   */
  async fetchDefaultSoundboardSounds() {
    const data = await this.rest.get(Routes.soundboardDefaultSounds()) as any;
    return new Collection(data.map((sound) => [sound.sound_id, new SoundboardSound(this, sound)]));
  }

  /**
   * Obtains a guild preview from Discord, available for all guilds the bot is in and all Discoverable guilds.
   *
   * @param {GuildResolvable} guild The guild to fetch the preview for
   * @returns {Promise<GuildPreview>}
   */
  async fetchGuildPreview(guild: any) {
    const id = this.guilds.resolveId(guild);
    if (!id) throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'guild', 'GuildResolvable');
    const data = await this.rest.get(Routes.guildPreview(id)) as any;
    return new GuildPreview(this, data);
  }

  /**
   * Obtains the widget data of a guild from Discord, available for guilds with the widget enabled.
   *
   * @param {GuildResolvable} guild The guild to fetch the widget data for
   * @returns {Promise<Widget>}
   */
  async fetchGuildWidget(guild: any) {
    const id = this.guilds.resolveId(guild);
    if (!id) throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'guild', 'GuildResolvable');
    const data = await this.rest.get(Routes.guildWidgetJSON(id)) as any;
    return new Widget(this, data);
  }



  /**
   * Generates a link that can be used to invite the bot to a guild.
   *
   * @param {InviteGenerationOptions} [options={}] Options for the invite
   * @returns {string}
   * @example
   * const link = client.generateInvite({
   *   scopes: [OAuth2Scopes.ApplicationsCommands],
   * });
   * console.log(`Generated application invite link: ${link}`);
   * @example
   * const link = client.generateInvite({
   *   permissions: [
   *     PermissionFlagsBits.SendMessages,
   *     PermissionFlagsBits.ManageGuild,
   *     PermissionFlagsBits.MentionEveryone,
   *   ],
   *   scopes: [OAuth2Scopes.Bot],
   * });
   * console.log(`Generated bot invite link: ${link}`);
   */
  generateInvite(options: InviteGenerationOptions | any = {}) {
    if (typeof options !== 'object') throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'options', 'object', true);
    if (!this.application) throw new DiscordjsError(ErrorCodes.ClientNotReady, 'generate an invite link');

    const { scopes } = options;
    if (scopes === undefined) {
      throw new DiscordjsTypeError(ErrorCodes.InvalidMissingScopes);
    }

    if (!Array.isArray(scopes)) {
      throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'scopes', 'Array of Invite Scopes', true);
    }

    if (!scopes.some(scope => [OAuth2Scopes.Bot, OAuth2Scopes.ApplicationsCommands].includes(scope))) {
      throw new DiscordjsTypeError(ErrorCodes.InvalidMissingScopes);
    }

    if (!scopes.includes(OAuth2Scopes.Bot) && options.permissions) {
      throw new DiscordjsTypeError(ErrorCodes.InvalidScopesWithPermissions);
    }

    const validScopes = Object.values(OAuth2Scopes);
    const invalidScope = scopes.find(scope => !validScopes.includes(scope));
    if (invalidScope) {
      throw new DiscordjsTypeError(ErrorCodes.InvalidElement, 'Array', 'scopes', invalidScope);
    }

    const query = makeURLSearchParams({
      client_id: this.application.id,
      scope: scopes.join(' '),
      disable_guild_select: options.disableGuildSelect,
    });

    if (options.permissions) {
      const permissions = PermissionsBitField.resolve(options.permissions);
      if (permissions) query.set('permissions', permissions.toString());
    }

    if (options.guild) {
      const guildId = this.guilds.resolveId(options.guild);
      if (!guildId) throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'options.guild', 'GuildResolvable');
      query.set('guild_id', guildId);
    }

    return `${this.options.rest.api}${Routes.oauth2Authorization()}?${query}`;
  }

  toJSON() {
    return flatten(this, { actions: false, presence: false });
  }

  /**
   * Partially censored client token for debug logging purposes.
   *
   * @type {?string}
   * @readonly
   * @private
   */
  get _censoredToken() {
    if (!this.token) return null;

    return this.token
      .split('.')
      .map((val, index) => (index > 1 ? val.replaceAll(/./g, '*') : val))
      .join('.');
  }

  /**
   * Calls {@link https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/eval} on a script
   * with the client as `this`.
   *
   * @param {string} script Script to eval
   * @returns {*}
   * @private
   */
  _eval(script: string) {
    // eslint-disable-next-line no-eval
    return eval(script);
  }

  /**
   * Validates the client options.
   *
   * @param {ClientOptions} [options=this.options] Options to validate
   * @private
   */
  _validateOptions(options = this.options) {
    if (options.intents === undefined && options.ws?.intents === undefined) {
      throw new DiscordjsTypeError(ErrorCodes.ClientMissingIntents);
    } else {
      options.intents = new IntentsBitField(options.intents ?? options.ws.intents).freeze();
    }

    if (typeof options.sweepers !== 'object' || options.sweepers === null) {
      throw new DiscordjsTypeError(ErrorCodes.ClientInvalidOption, 'sweepers', 'an object');
    }

    if (!Array.isArray(options.partials)) {
      throw new DiscordjsTypeError(ErrorCodes.ClientInvalidOption, 'partials', 'an Array');
    }

    if (typeof options.waitGuildTimeout !== 'number' || Number.isNaN(options.waitGuildTimeout)) {
      throw new DiscordjsTypeError(ErrorCodes.ClientInvalidOption, 'waitGuildTimeout', 'a number');
    }

    if (typeof options.failIfNotExists !== 'boolean') {
      throw new DiscordjsTypeError(ErrorCodes.ClientInvalidOption, 'failIfNotExists', 'a boolean');
    }

    if (typeof options.enforceNonce !== 'boolean') {
      throw new DiscordjsTypeError(ErrorCodes.ClientInvalidOption, 'enforceNonce', 'a boolean');
    }

    if (
      (typeof options.allowedMentions !== 'object' && options.allowedMentions !== undefined) ||
      options.allowedMentions === null
    ) {
      throw new DiscordjsTypeError(ErrorCodes.ClientInvalidOption, 'allowedMentions', 'an object');
    }

    if (typeof options.ws !== 'object' || options.ws === null) {
      throw new DiscordjsTypeError(ErrorCodes.ClientInvalidOption, 'ws', 'an object');
    }

    if (
      (typeof options.presence !== 'object' || options.presence === null) &&
      options.ws.initialPresence === undefined
    ) {
      throw new DiscordjsTypeError(ErrorCodes.ClientInvalidOption, 'presence', 'an object');
    } else {
      options.ws.initialPresence = options.ws.initialPresence ?? this.presence._parse(this.options.presence);
    }

    if (typeof options.rest !== 'object' || options.rest === null) {
      throw new DiscordjsTypeError(ErrorCodes.ClientInvalidOption, 'rest', 'an object');
    }

    if (typeof options.jsonTransformer !== 'function') {
      throw new DiscordjsTypeError(ErrorCodes.ClientInvalidOption, 'jsonTransformer', 'a function');
    }
  }

  async [Symbol.asyncDispose]() {
    await this.destroy();
  }
}



/**
 * @class SnowflakeUtil
 * @classdesc This class is an alias for {@link https://www.npmjs.com/package/@ovencord/util @ovencord/util}'s
 * `DiscordSnowflake` class.
 * @hideconstructor
 */

/**
 * A {@link https://docs.x.com/resources/fundamentals/x-ids Twitter snowflake},
 * except the epoch is 2015-01-01T00:00:00.000Z.
 *
 * If we have a snowflake '266241948824764416' we can represent it as binary:
 * ```
 * 64                                          22     17     12          0
 *  000000111011000111100001101001000101000000  00001  00000  000000000000
 *  number of milliseconds since Discord epoch  worker  pid    increment
 * ```
 *
 * @typedef {string} Snowflake
 */

/**
 * Emitted for general debugging information.
 *
 * @event Client#debug
 * @param {string} info The debug information
 */

/**
 * Emitted for general warnings.
 *
 * @event Client#warn
 * @param {string} info The warning
 */

/**
 * @external Collection
 * @see {@link https://discord.js.org/docs/packages/collection/stable/Collection:Class}
 */

/**
 * @external REST
 * @see {@link https://discord.js.org/docs/packages/rest/stable/REST:Class}
 */

/**
 * @external ImageURLOptions
 * @see {@link https://discord.js.org/docs/packages/rest/stable/ImageURLOptions:Interface}
 */

/**
 * @external EmojiURLOptions
 * @see {@link https://discord.js.org/docs/packages/rest/stable/EmojiURLOptions:TypeAlias}
 */

/**
 * @external BaseImageURLOptions
 * @see {@link https://discord.js.org/docs/packages/rest/stable/BaseImageURLOptions:Interface}
 */
