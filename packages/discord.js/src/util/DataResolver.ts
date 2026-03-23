import { lazy } from '@ovencord/util';
import { DiscordjsError, DiscordjsTypeError, ErrorCodes } from '../errors/index.js';
import { BaseInvite } from '../structures/BaseInvite.js';

// Fixes circular dependencies.
const getGuildTemplate = lazy(() => require('../structures/GuildTemplate.js').GuildTemplate);

/**
 * Data that can be resolved to give an invite code. This can be:
 * - An invite code
 * - An invite URL
 */
export type InviteResolvable = string;

/**
 * Data that can be resolved to give a template code. This can be:
 * - A template code
 * - A template URL
 */
export type GuildTemplateResolvable = string;

export function resolveCode(data: string, regex: RegExp): string {
	return regex.exec(data)?.[1] ?? data;
}

export function resolveInviteCode(data: InviteResolvable): string {
	return resolveCode(data, BaseInvite.InvitesPattern);
}

export function resolveGuildTemplateCode(data: GuildTemplateResolvable): string {
	return resolveCode(data, getGuildTemplate().GuildTemplatesPattern);
}

/**
 * Data that can be resolved to give a Buffer. This can be:
 * - A Buffer
 * - The path to a local file
 * - A URL
 */
export type BufferResolvable =
	| string
	| Buffer
	| Uint8Array
	| ArrayBuffer
	| Blob
	| AsyncIterable<Uint8Array | ArrayBuffer | string>;

/**
 * @typedef {Object} ResolvedFile
 * @property {Buffer | Uint8Array} data Buffer containing the file data
 * @property {string} [contentType] Content-Type of the file
 * @private
 */
export interface ResolvedFile {
	data: Buffer | Uint8Array;
	contentType?: string;
}

export async function resolveFile(resource: BufferResolvable): Promise<ResolvedFile> {
	if (Buffer.isBuffer(resource)) return { data: resource };

	// Uint8Array (non-Buffer) — from image generators, canvas, etc.
	if (resource instanceof Uint8Array) return { data: Buffer.from(resource) };

	// ArrayBuffer
	if (resource instanceof ArrayBuffer) return { data: Buffer.from(resource) };

	// Blob / File (Web API)
	if (resource instanceof Blob) {
		return {
			data: Buffer.from(await resource.arrayBuffer()),
			contentType: resource.type || undefined,
		};
	}

	if (resource && Symbol.asyncIterator in (resource as object)) {
		const iterable = resource as AsyncIterable<Uint8Array | ArrayBuffer | string>;
		const chunks: Uint8Array[] = [];
		let totalLen = 0;
		for await (const data of iterable) {
			const chunk =
				data instanceof Uint8Array
					? data
					: new Uint8Array(typeof data === 'string' ? Buffer.from(data) : (data as ArrayBuffer));
			chunks.push(chunk);
			totalLen += chunk.byteLength;
		}
		const merged = new Uint8Array(totalLen);
		let offset = 0;
		for (const chunk of chunks) {
			merged.set(chunk, offset);
			offset += chunk.byteLength;
		}
		return { data: merged };
	}

	if (typeof resource === 'string') {
		if (/^https?:\/\//.test(resource)) {
			const res = await fetch(resource);
			return { data: Buffer.from(await res.arrayBuffer()), contentType: res.headers.get('content-type') };
		}

		const bunFile = Bun.file(resource);
		if (!(await bunFile.exists())) throw new DiscordjsError(ErrorCodes.FileNotFound, resource);
		return { data: Buffer.from(await bunFile.arrayBuffer()) };
	}

	throw new DiscordjsTypeError(ErrorCodes.ReqResourceType);
}

/**
 * Data that resolves to give a Base64 string, typically for image uploading. This can be:
 * - A Buffer
 * - A base64 string
 */
export type Base64Resolvable = Buffer | string;

/**
 * Resolves a Base64Resolvable to a Base 64 string.
 *
 * @param {Base64Resolvable} data The base 64 resolvable you want to resolve
 * @param {string} [contentType='image/jpg'] The content type of the data
 * @returns {string}
 */
export function resolveBase64(data: Base64Resolvable, contentType = 'image/jpg'): string {
	if (Buffer.isBuffer(data)) return `data:${contentType};base64,${data.toString('base64')}`;
	return data;
}

export async function resolveImage(image: BufferResolvable | Base64Resolvable): Promise<string | null> {
	if (!image) return null;
	if (typeof image === 'string' && image.startsWith('data:')) {
		return image;
	}

	const file = await resolveFile(image as BufferResolvable);
	return resolveBase64(Buffer.from(file.data), 'image/jpg');
}
