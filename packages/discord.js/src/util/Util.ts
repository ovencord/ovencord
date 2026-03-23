import { Collection } from '@ovencord/collection';
import { lazy } from '@ovencord/util';
import {
	type APIChannel,
	type APIEmoji,
	type APIInteractionDataResolved,
	ChannelType,
	RouteBases,
	Routes,
	type Snowflake,
} from 'discord-api-types/v10';
import type { Client } from '../client/Client.js';
import { DiscordjsError, DiscordjsRangeError, DiscordjsTypeError, ErrorCodes } from '../errors/index.js';
import type { BaseChannel } from '../structures/BaseChannel.js';
import type { Role } from '../structures/Role.js';
import { Colors } from './Colors.js';

// Fixes circular dependencies.
const getAttachment = lazy(() => require('../structures/Attachment.js').Attachment);
const getGuildChannel = lazy(() => require('../structures/GuildChannel.js').GuildChannel);
const getSKU = lazy(() => require('../structures/SKU.js').SKU);

const isObject = (data: unknown): data is object => typeof data === 'object' && data !== null;

/**
 * Data that can be resolved into a color.
 */
export type ColorResolvable = keyof typeof Colors | 'Random' | 'Default' | number | [number, number, number];

/**
 * Data for a partial emoji.
 */
export interface PartialEmoji {
	animated: boolean;
	id?: Snowflake;
	name: string;
}

/**
 * Data for a partial emoji with only an id.
 */
export interface PartialEmojiOnlyId {
	id: Snowflake;
}

/**
 * Data that can be resolved into an emoji.
 */
export type EmojiIdentifierResolvable =
	| string
	| Snowflake
	| APIEmoji
	| { id?: Snowflake; name?: string; animated?: boolean };

/**
 * Data to support the transformation of resolved data.
 */
export interface SupportingInteractionResolvedData {
	client: Client;
	guild?: any; // Guild remains complex due to circularity
	channel?: any; // Channel remains complex due to circularity
}

/**
 * Options used to make an error object.
 */
export interface MakeErrorOptions {
	name: string;
	message: string;
	stack?: string;
}

export function flatten(obj: unknown, ...props: Record<string, boolean | string>[]): any {
	return _flatten(obj, new WeakSet(), 0, ...props);
}

const MAX_FLATTEN_DEPTH = 10;

function _flatten(obj: unknown, seen: WeakSet<object>, depth: number, ...props: Record<string, boolean | string>[]): any {
	if (!isObject(obj)) return obj;

	// Depth guard — prevents stack overflow from deeply nested object trees
	if (depth > MAX_FLATTEN_DEPTH) return {};

	// Circular reference guard
	if (seen.has(obj)) return '[Circular]';
	seen.add(obj);

	const objProps = Object.keys(obj)
		.filter((key) => !key.startsWith('_'))
		.map((key) => ({ [key]: true }));

	const mergedProps = objProps.length
		? Object.assign(Object.assign({}, ...objProps), ...props)
		: Object.assign({}, ...props);

	const out: any = {};

	for (let [prop, newProp] of Object.entries(mergedProps)) {
		if (!newProp) continue;
		newProp = newProp === true ? prop : newProp;

		const element = (obj as any)[prop];
		const elemIsObj = isObject(element);
		const elementValueOf =
			elemIsObj && typeof (element as any).valueOf === 'function' ? (element as any).valueOf() : null;
		const hasToJSON = elemIsObj && typeof (element as any).toJSON === 'function';

		// If it's a Collection, make the array of keys
		if (element instanceof Collection) out[newProp as string] = Array.from(element.keys());
		// If the valueOf is a Collection, use its array of keys
		else if (elementValueOf instanceof Collection) out[newProp as string] = Array.from(elementValueOf.keys());
		// If it's an array, call toJSON function on each element if present, otherwise flatten each element
		else if (Array.isArray(element))
			out[newProp as string] = element.map((elm: any) => (elm as any).toJSON?.() ?? _flatten(elm, seen, depth + 1));
		// If it's an object with a primitive `valueOf`, use that value
		else if (typeof elementValueOf !== 'object') out[newProp as string] = elementValueOf;
		// If it's an object with a toJSON function, use the return value of it
		else if (hasToJSON) out[newProp as string] = (element as any).toJSON();
		// If element is an object, use the flattened version of it
		else if (typeof element === 'object') out[newProp as string] = _flatten(element, seen, depth + 1, ...props);
		// If it's a primitive
		else if (!elemIsObj) out[newProp as string] = element;
	}

	return out;
}

/**
 * @typedef {Object} FetchRecommendedShardCountOptions
 * @property {number} [guildsPerShard=1000] Number of guilds assigned per shard
 * @property {number} [multipleOf=1] The multiple the shard count should round up to. (16 for large bot sharding)
 */

export async function fetchRecommendedShardCount(
	token: string,
	{ guildsPerShard = 1_000, multipleOf = 1 } = {},
): Promise<number> {
	if (!token) throw new DiscordjsError(ErrorCodes.TokenMissing);
	const response = await fetch(`${RouteBases.api}${Routes.gatewayBot()}`, {
		method: 'GET',
		headers: { Authorization: `Bot ${token.replace(/^bot\s*/i, '')}` },
	});
	if (!response.ok) {
		if (response.status === 401) throw new DiscordjsError(ErrorCodes.TokenInvalid);
		throw response;
	}

	const { shards } = (await response.json()) as { shards: number };
	return Math.ceil((shards * (1_000 / guildsPerShard)) / multipleOf) * multipleOf;
}

export function parseEmoji(text: string): PartialEmoji | null {
	const decodedText = text.includes('%') ? decodeURIComponent(text) : text;
	if (!decodedText.includes(':')) return { animated: false, name: decodedText, id: undefined };
	const match = /<?(?:(?<animated>a):)?(?<name>\w{2,32}):(?<id>\d{17,19})?>?/.exec(decodedText);
	return (
		match && {
			animated: Boolean(match.groups?.animated),
			name: match.groups?.name as string,
			id: match.groups?.id as Snowflake,
		}
	);
}

export function resolvePartialEmoji(emoji: EmojiIdentifierResolvable): PartialEmoji | PartialEmojiOnlyId | null {
	if (!emoji) return null;
	if (typeof emoji === 'string') return /^\d{17,19}$/.test(emoji) ? { id: emoji } : parseEmoji(emoji);
	const { id, name, animated } = emoji as { id?: Snowflake; name?: string; animated?: boolean };
	if (!id && !name) return null;
	return { id, name, animated: Boolean(animated) };
}

export function resolveGuildEmoji(client: Client, emojiId: string): any {
	for (const guild of client.guilds.cache.values()) {
		if (!guild.available) {
			continue;
		}

		const emoji = guild.emojis.cache.get(emojiId);

		if (emoji) {
			return emoji;
		}
	}

	return null;
}

export function makeError(obj: MakeErrorOptions): Error {
	const err = new Error(obj.message);
	err.name = obj.name;
	if (obj.stack) err.stack = obj.stack;
	return err;
}

export function makePlainError(err: Error): MakeErrorOptions {
	return {
		name: err.name,
		message: err.message,
		stack: err.stack,
	};
}

const TextSortableGroupTypes = [
	ChannelType.GuildText,
	ChannelType.GuildAnnouncement,
	ChannelType.GuildForum,
	ChannelType.GuildMedia,
];

const VoiceSortableGroupTypes = [ChannelType.GuildVoice, ChannelType.GuildStageVoice];
const CategorySortableGroupTypes = [ChannelType.GuildCategory];

/**
 * Gets an array of the channel types that can be moved in the channel group. For example, a GuildText channel would
 * return an array containing the types that can be ordered within the text channels (always at the top), and a voice
 * channel would return an array containing the types that can be ordered within the voice channels (always at the
 * bottom).
 *
 * @param {ChannelType} type The type of the channel
 * @returns {ChannelType[]}
 * @private
 */
export function getSortableGroupTypes(type: ChannelType): ChannelType[] {
	switch (type) {
		case ChannelType.GuildText:
		case ChannelType.GuildAnnouncement:
		case ChannelType.GuildForum:
		case ChannelType.GuildMedia:
			return TextSortableGroupTypes;
		case ChannelType.GuildVoice:
		case ChannelType.GuildStageVoice:
			return VoiceSortableGroupTypes;
		case ChannelType.GuildCategory:
			return CategorySortableGroupTypes;
		default:
			return [type];
	}
}

export function moveElementInArray<T>(array: T[], element: T, newIndex: number, offset = false): number {
	const index = array.indexOf(element);
	const targetIndex = (offset ? index : 0) + newIndex;
	if (targetIndex > -1 && targetIndex < array.length) {
		const removedElement = array.splice(index, 1)[0];
		array.splice(targetIndex, 0, removedElement);
	}

	return array.indexOf(element);
}

export function verifyString(
	data: unknown,
	error: ErrorConstructor = Error,
	errorMessage = `Expected a string, got ${data} instead.`,
	allowEmpty = true,
): string {
	if (typeof data !== 'string') throw new error(errorMessage);
	if (!allowEmpty && data.length === 0) throw new error(errorMessage);
	return data;
}

export function resolveColor(color: ColorResolvable): number {
	let resolvedColor: number;

	if (typeof color === 'string') {
		if (color === 'Random') return Math.floor(Math.random() * (0xffffff + 1));
		if (color === 'Default') return 0;
		if (/^#?[\da-f]{6}$/i.test(color)) return Number.parseInt(color.replace('#', ''), 16);
		resolvedColor = Colors[color as keyof typeof Colors];
	} else if (Array.isArray(color)) {
		resolvedColor = (color[0] << 16) + (color[1] << 8) + color[2];
	} else {
		resolvedColor = color as number;
	}

	if (!Number.isInteger(resolvedColor)) {
		throw new DiscordjsTypeError(ErrorCodes.ColorConvert, color);
	}

	if (resolvedColor < 0 || resolvedColor > 0xffffff) {
		throw new DiscordjsRangeError(ErrorCodes.ColorRange);
	}

	return resolvedColor;
}

export function discordSort<T extends { id: Snowflake; rawPosition: number }>(
	collection: Collection<string, T>,
): Collection<string, T> {
	const isGuildChannel = collection.first() instanceof getGuildChannel();
	return collection.toSorted(
		isGuildChannel
			? (a, b) => a.rawPosition - b.rawPosition || Number(BigInt(a.id) - BigInt(b.id))
			: (a, b) => a.rawPosition - b.rawPosition || Number(BigInt(b.id) - BigInt(a.id)),
	);
}

export async function setPosition<T extends { id: Snowflake }>(
	item: T,
	position: number,
	relative: boolean,
	sorted: Collection<string, T>,
	client: Client,
	route: string,
	reason?: string,
): Promise<{ id: Snowflake; position: number }[]> {
	const updatedItemsList = [...sorted.values()];
	moveElementInArray(updatedItemsList, item, position, relative);
	const updatedItems = updatedItemsList.map((innerItem, index) => ({ id: innerItem.id, position: index }));
	await (client as { rest: { patch: Function } }).rest.patch(route, { body: updatedItems, reason });
	return updatedItems;
}

/**
 * Alternative to Node's `path.basename`, removing query string after the extension if it exists.
 *
 * @param {string} path Path to get the basename of
 * @param {string} [ext] File extension to remove
 * @returns {string} Basename of the path
 * @private
 */
export function basename(filePath: string, ext?: string): string {
	const lastSlash = Math.max(filePath.lastIndexOf('/'), filePath.lastIndexOf('\\'));
	const base = filePath.slice(lastSlash + 1).split('?')[0];
	if (ext && base.endsWith(ext)) return base.slice(0, -ext.length);
	return base;
}

export function findName(thing: unknown): string {
	if (!thing) return 'file.bin';

	if (Buffer.isBuffer(thing) || thing instanceof Uint8Array || thing instanceof ArrayBuffer || thing instanceof Blob) {
		return 'file.bin';
	}

	if (typeof thing === 'string') {
		return basename(thing);
	}

	if (thing && typeof thing === 'object' && 'path' in thing && typeof thing.path === 'string') {
		return basename(thing.path);
	}

	return 'file.jpg';
}

export function cleanContent(str: string, channel: any): string {
	return str.replaceAll(
		/<(?:(?<type>@[!&]?|#)|(?:\/(?<commandName>[-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai} ]+):)|(?:a?:(?<emojiName>[\w]+):))(?<id>\d{17,19})>/gu,
		(match, type, commandName, emojiName, id) => {
			if (commandName) return `/${commandName as string}`;

			if (emojiName) return `:${emojiName as string}:`;

			switch (type) {
				case '@':
				case '@!': {
					const member = channel.guild?.members.cache.get(id);
					if (member) {
						return `@${member.displayName as string}`;
					}

					const user = channel.client.users.cache.get(id);
					return user ? `@${user.displayName as string}` : match;
				}

				case '@&': {
					if (channel.type === ChannelType.DM) return match;
					const role = channel.guild.roles.cache.get(id);
					return role ? `@${role.name as string}` : match;
				}

				case '#': {
					const mentionedChannel = channel.client.channels.cache.get(id);
					return mentionedChannel ? `#${mentionedChannel.name as string}` : match;
				}

				default: {
					return match;
				}
			}
		},
	);
}

/**
 * The content to put in a code block with all code block fences replaced by the equivalent backticks.
 *
 * @param {string} text The string to be converted
 * @returns {string}
 */
export function cleanCodeBlockContent(text: string): string {
	return text.replaceAll('```', '`\u200B``');
}

export function parseWebhookURL(url: string): { id: Snowflake; token: string } | null {
	const matches =
		/https?:\/\/(?:ptb\.|canary\.)?discord\.com\/api(?:\/v\d{1,2})?\/webhooks\/(?<id>\d{17,19})\/(?<token>[\w-]{68})/i.exec(
			url,
		);

	if (!matches?.groups) return null;
	return { id: matches.groups.id as Snowflake, token: matches.groups.token };
}

export function transformResolved(
	{ client, guild, channel }: SupportingInteractionResolvedData,
	{ members, users, channels, roles, attachments, ...other }: APIInteractionDataResolved = {},
): Record<string, Collection<Snowflake, any>> {
	const result: Record<string, Collection<Snowflake, any>> = {};
	const messages = (other as { messages?: Record<string, unknown> }).messages;

	if (members) {
		result.members = new Collection<Snowflake, any>();
		for (const [id, member] of Object.entries(members)) {
			const user = (users as Record<string, any> | undefined)?.[id];
			result.members.set(id as Snowflake, (guild?.members as { _add: Function })?._add({ user, ...member }) ?? member);
		}
	}

	if (users) {
		result.users = new Collection<Snowflake, any>();
		for (const user of Object.values(users)) {
			result.users.set(user.id as Snowflake, (client.users as { _add: Function })._add(user));
		}
	}

	if (roles) {
		result.roles = new Collection<Snowflake, any>();
		for (const role of Object.values(roles)) {
			result.roles.set((role as { id: string }).id as Snowflake, (guild?.roles as { _add: Function })?._add(role) ?? role);
		}
	}

	if (channels) {
		result.channels = new Collection<Snowflake, BaseChannel | APIChannel>();
		for (const apiChannel of Object.values(channels)) {
			result.channels.set(
				(apiChannel as { id: string }).id as Snowflake,
				(client.channels as unknown as { unify: Function }).unify(apiChannel, guild) ?? apiChannel,
			);
		}
	}

	if (messages) {
		result.messages = new Collection<Snowflake, any>();
		for (const message of Object.values(messages)) {
			result.messages.set((message as { id: string }).id as Snowflake, (channel?.messages as { _add: Function })?._add(message) ?? message);
		}
	}

	if (attachments) {
		result.attachments = new Collection<Snowflake, any>();
		for (const attachment of Object.values(attachments)) {
			const patched = new (getAttachment() as { new (data: unknown): any })(attachment);
			result.attachments.set((attachment as { id: string }).id as Snowflake, patched);
		}
	}

	return result;
}

export function resolveSKUId(resolvable: Snowflake | { id: Snowflake }): Snowflake | null {
	if (typeof resolvable === 'string') return resolvable;
	if (resolvable instanceof (getSKU() as { new (...args: any[]): any })) return (resolvable as { id: Snowflake }).id;
	if (typeof resolvable === 'object' && 'id' in resolvable) return resolvable.id;
	return null;
}
