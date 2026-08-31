import { Collection } from '@ovencord/collection';
import { makeURLSearchParams } from '@ovencord/rest';
import type { Snowflake } from 'discord-api-types/v10';
import { Routes } from 'discord-api-types/v10';
import { DiscordjsTypeError, ErrorCodes } from '../errors/index.js';
import type { ThreadChannel } from '../structures/ThreadChannel.js';
import { ThreadMember } from '../structures/ThreadMember.js';
import { CachedManager } from './CachedManager.js';
import type { BaseFetchOptions, UserResolvable } from './UserManager.js';

export type ThreadMemberResolvable = ThreadMember | UserResolvable;

export interface FetchThreadMemberOptions extends BaseFetchOptions {
	member: ThreadMemberResolvable;
	withMember?: boolean;
}

export interface FetchThreadMembersOptions {
	withMember?: boolean;
	after?: Snowflake;
	limit?: number;
	cache?: boolean;
}

/**
 * Manages API methods for GuildMembers and stores their cache.
 *
 * @extends {CachedManager}
 */
export class ThreadMemberManager extends CachedManager<Snowflake, ThreadMember, ThreadMemberResolvable> {
	public thread: ThreadChannel;
	// biome-ignore lint/suspicious/noExplicitAny: iterable hydration
	constructor(thread: ThreadChannel, iterable?: Iterable<any>) {
		super(thread.client, ThreadMember, iterable);

		/**
		 * The thread this manager belongs to
		 *
		 * @type {ThreadChannel}
		 */
		this.thread = thread;
	}

	// biome-ignore lint/suspicious/noExplicitAny: internal cache hydration
	override _add(data: any, cache = true) {
		const existing = this.cache.get(data.user_id);
		if (cache) existing?._patch(data, { cache });
		if (existing) return existing;

		const member = new ThreadMember(this.thread, data, { cache });
		if (cache) this.cache.set(data.user_id, member);
		return member;
	}

	/**
	 * Fetches the client user as a ThreadMember of the thread.
	 *
	 * @param {BaseFetchOptions} [options] The options for fetching the member
	 * @returns {Promise<ThreadMember>}
	 */
	async fetchMe(options?: BaseFetchOptions): Promise<ThreadMember> {
		return this.fetch({ ...options, member: this.client.user?.id as Snowflake }) as Promise<ThreadMember>;
	}

	/**
	 * The client user as a ThreadMember of this ThreadChannel
	 *
	 * @type {?ThreadMember}
	 * @readonly
	 */
	get me(): ThreadMember | null {
		return this.cache.get(this.client.user?.id as Snowflake) ?? null;
	}

	/**
	 * Resolves a {@link ThreadMemberResolvable} to a {@link ThreadMember} object.
	 *
	 * @param {ThreadMemberResolvable} member The user that is part of the thread
	 * @returns {?GuildMember}
	 */
	override resolve(member: ThreadMemberResolvable | null | undefined): ThreadMember | null {
		const memberResolvable = super.resolve(member);
		if (memberResolvable) return memberResolvable;
		const userId = this.client.users.resolveId(member as UserResolvable);
		if (userId) return super.cache.get(userId) ?? null;
		return null;
	}

	/**
	 * Resolves a {@link ThreadMemberResolvable} to a {@link ThreadMember} id string.
	 *
	 * @param {ThreadMemberResolvable} member The user that is part of the guild
	 * @returns {?Snowflake}
	 */
	override resolveId(member: ThreadMemberResolvable | null | undefined): Snowflake | null {
		const memberResolvable = super.resolveId(member);
		if (memberResolvable) return memberResolvable;
		const userResolvable = this.client.users.resolveId(member as UserResolvable);
		return userResolvable && this.cache.has(userResolvable) ? userResolvable : null;
	}

	/**
	 * Adds a member to the thread.
	 *
	 * @param {UserResolvable|'@me'} member The member to add
	 * @returns {Promise<Snowflake>}
	 */
	async add(member: UserResolvable | '@me'): Promise<Snowflake> {
		const id = member === '@me' ? member : this.client.users.resolveId(member);
		if (!id) throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'member', 'UserResolvable');
		await this.client.rest.put(Routes.threadMembers(this.thread.id, id));
		return id;
	}

	/**
	 * Remove a user from the thread.
	 *
	 * @param {UserResolvable|'@me'} member The member to remove
	 * @returns {Promise<Snowflake>}
	 */
	async remove(member: UserResolvable | '@me'): Promise<Snowflake> {
		const id = member === '@me' ? member : this.client.users.resolveId(member);
		if (!id) throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'member', 'UserResolvable');
		await this.client.rest.delete(Routes.threadMembers(this.thread.id, id));
		return id;
	}

	/**
	 * Fetches thread member(s) from Discord.
	 * <info>This method requires the {@link GatewayIntentBits.GuildMembers} privileged gateway intent.</info>
	 *
	 * @param {ThreadMemberResolvable|FetchThreadMemberOptions|FetchThreadMembersOptions} [options]
	 * Options for fetching thread member(s)
	 * @returns {Promise<ThreadMember|Collection<Snowflake, ThreadMember>>}
	 */
	async fetch(
		options?: ThreadMemberResolvable | FetchThreadMemberOptions | FetchThreadMembersOptions,
	): Promise<ThreadMember | Collection<Snowflake, ThreadMember>> {
		if (!options) return this._fetchMany();
		const { member, withMember, cache, force } = (options as FetchThreadMemberOptions) ?? {};
		const resolvedMember = this.resolveId(member ?? (options as ThreadMemberResolvable));
		if (resolvedMember) return this._fetchSingle({ member: resolvedMember, withMember, cache, force });
		return this._fetchMany(options as FetchThreadMembersOptions);
	}

	// biome-ignore lint/suspicious/noExplicitAny: fetch helper
	async _fetchSingle({ member, withMember, cache, force = false }: any): Promise<ThreadMember> {
		if (!force) {
			const existing = this.cache.get(member);
			if (existing) return existing;
		}

		const data = await this.client.rest.get(Routes.threadMembers(this.thread.id, member), {
			query: makeURLSearchParams({ with_member: withMember }),
		});

		return this._add(data, cache);
	}

	// biome-ignore lint/suspicious/noExplicitAny: fetch helper
	async _fetchMany({ withMember, after, limit, cache }: any = {}): Promise<Collection<Snowflake, ThreadMember>> {
		const data = (await this.client.rest.get(Routes.threadMembers(this.thread.id), {
			query: makeURLSearchParams({ with_member: withMember, after, limit }),
		})) as any[];

		return data.reduce(
			// biome-ignore lint/suspicious/noExplicitAny: reducer accumulation
			(col: Collection<Snowflake, ThreadMember>, member: any) => col.set(member.user_id, this._add(member, cache)),
			new Collection(),
		);
	}
}
