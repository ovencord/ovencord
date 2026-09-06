import {
	type APIChannel,
	type APIGuildIntegrationApplication,
	type APIInvite,
	type InviteTargetType,
	InviteType,
	PermissionFlagsBits,
	Routes,
	type Snowflake,
} from 'discord-api-types/v10';
import type { Client } from '../client/Client.js';
import { DiscordjsError, ErrorCodes } from '../errors/index.js';
import { InviteFlagsBitField } from '../util/InviteFlagsBitField.js';
import { BaseInvite } from './BaseInvite.js';
import type { Guild } from './Guild.js';
import { GuildScheduledEvent } from './GuildScheduledEvent.js';
import { IntegrationApplication } from './IntegrationApplication.js';
import { InviteGuild } from './InviteGuild.js';
import type { User } from './User.js';

/**
 * A channel invite leading to a guild.
 *
 * @extends {BaseInvite}
 */
export class GuildInvite extends BaseInvite {
	public override type: InviteType.Guild;
	public guildId: Snowflake;
	public flags!: Readonly<InviteFlagsBitField>;
	public guild: Guild | InviteGuild | null;
	public channel: any; // Keep any for now as GuildInvitableChannel is complex
	public targetType: InviteTargetType | null;
	public targetUser: User | null;
	public targetApplication: IntegrationApplication | null;
	public guildScheduledEvent: GuildScheduledEvent | null;
	public uses: number | null;
	public maxUses: number | null;
	public temporary: boolean | null;
	public approximatePresenceCount: number | null;

	constructor(client: Client, data: APIInvite) {
		super(client, data);

		// Type may be missing from audit logs.
		this.type = InviteType.Guild;

		/**
		 * The id of the guild this invite is for.
		 *
		 * @type {Snowflake}
		 */
		// Guild id may be missing from audit logs.
		this.guildId = ((data as any).guild_id ?? (data.guild as any)?.id) as Snowflake;
	}

	_patch(data: Partial<APIInvite>) {
		super._patch(data);

		if ('flags' in data) {
			/**
			 * The flags of this invite.
			 *
			 * @type {Readonly<InviteFlagsBitField>}
			 */
			this.flags = new InviteFlagsBitField(data.flags).freeze();
		} else {
			this.flags ??= new InviteFlagsBitField().freeze();
		}

		if ('guild' in data && data.guild) {
			/**
			 * The guild the invite is for. May include welcome screen data.
			 *
			 * @type {?(Guild|InviteGuild)}
			 */
			this.guild =
				this.client.guilds.cache.get((data.guild as any).id) ?? new InviteGuild(this.client, data.guild as any);
		} else {
			this.guild ??= null;
		}

		if ('channel' in data && data.channel) {
			/**
			 * The channel this invite is for.
			 *
			 * @type {?GuildInvitableChannel}
			 */
			this.channel =
				this.client.channels._add(data.channel as unknown as APIChannel, this.guild, { cache: false }) ??
				this.client.channels.cache.get(this.channelId as Snowflake);

			this.channelId ??= data.channel.id;
		}

		if ('target_type' in data) {
			/**
			 * The target type.
			 *
			 * @type {?InviteTargetType}
			 */
			this.targetType = data.target_type as InviteTargetType | null;
		} else {
			this.targetType ??= null;
		}

		if ('target_user' in data && data.target_user) {
			/**
			 * The user whose stream to display for this voice channel stream invite.
			 *
			 * @type {?User}
			 */
			this.targetUser = this.client.users._add(data.target_user);
		} else {
			this.targetUser ??= null;
		}

		if ('target_application' in data && data.target_application) {
			/**
			 * The embedded application to open for this voice channel embedded application invite.
			 *
			 * @type {?IntegrationApplication}
			 */
			this.targetApplication = new IntegrationApplication(
				this.client,
				data.target_application as unknown as APIGuildIntegrationApplication,
			);
		} else {
			this.targetApplication ??= null;
		}

		if ('guild_scheduled_event' in data && data.guild_scheduled_event) {
			/**
			 * The guild scheduled event data if there is a {@link GuildScheduledEvent} in the channel.
			 *
			 * @type {?GuildScheduledEvent}
			 */
			this.guildScheduledEvent = new GuildScheduledEvent(this.client, data.guild_scheduled_event);
		} else {
			this.guildScheduledEvent ??= null;
		}

		if ('uses' in data) {
			/**
			 * How many times this invite has been used.
			 * <info>This is only available when the invite was fetched through {@link GuildInviteManager#fetch}
			 * or created through {@link GuildInviteManager#create}.</info>
			 *
			 * @type {?number}
			 */
			this.uses = (data as any).uses as number | null;
		} else {
			this.uses ??= null;
		}

		if ('max_uses' in data) {
			/**
			 * The maximum uses of this invite.
			 * <info>This is only available when the invite was fetched through {@link GuildInviteManager#fetch}
			 * or created through {@link GuildInviteManager#create}.</info>
			 *
			 * @type {?number}
			 */
			this.maxUses = (data as any).max_uses as number | null;
		} else {
			this.maxUses ??= null;
		}

		if ('temporary' in data) {
			/**
			 * Whether this invite grants temporary membership.
			 * <info>This is only available when the invite was fetched through {@link GuildInviteManager#fetch}
			 * or created through {@link GuildInviteManager#create}.</info>
			 *
			 * @type {?boolean}
			 */
			this.temporary = ((data as any).temporary ?? null) as boolean | null;
		} else {
			this.temporary ??= null;
		}

		if ('approximate_presence_count' in data) {
			/**
			 * The approximate number of online members of the guild.
			 * <info>This is only available when the invite was fetched through {@link Client#fetchInvite}.</info>
			 *
			 * @type {?number}
			 */
			this.approximatePresenceCount = (data as any).approximate_presence_count as number | null;
		} else {
			this.approximatePresenceCount ??= null;
		}
	}

	/**
	 * Whether the invite is deletable by the client user.
	 *
	 * @type {boolean}
	 * @readonly
	 */
	get deletable() {
		const guild = this.guild;
		if (!guild || !this.client.guilds.cache.has(guild.id)) return false;
		if (!('members' in guild)) return false;
		if (!guild.members.me) throw new DiscordjsError(ErrorCodes.GuildUncachedMe);
		return Boolean(
			this.channel?.permissionsFor(this.client.user).has(PermissionFlagsBits.ManageChannels, false) ||
				guild.members.me.permissions.has(PermissionFlagsBits.ManageGuild),
		);
	}

	/**
	 * Delete this invite.
	 *
	 * @param {string} [reason] Reason for deleting this invite
	 * @returns {Promise<void>}
	 */
	async delete(reason?: string): Promise<void> {
		await this.client.rest.delete(Routes.invite(this.code), { reason });
	}

	toJSON() {
		// @ts-expect-error
		return super.toJSON({
			url: true,
			expiresTimestamp: true,
			presenceCount: false,
			memberCount: false,
			uses: false,
			channel: 'channelId',
			inviter: 'inviterId',
			guild: 'guildId',
		});
	}
}
