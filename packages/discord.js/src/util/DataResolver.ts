import { lazy } from '@ovencord/util';
import { DiscordjsError, DiscordjsTypeError, ErrorCodes } from '../errors/index.js';
import { BaseInvite } from '../structures/BaseInvite.js';

// Fixes circular dependencies.
const getGuildTemplate = lazy(() => require('../structures/GuildTemplate.js').GuildTemplate);

export type InviteResolvable = string;
export type GuildTemplateResolvable = string;
export type BufferResolvable =
	| Buffer
	| Uint8Array
	| ArrayBuffer
	| Blob
	| string
	| AsyncIterable<Uint8Array | ArrayBuffer | Buffer>;
export type Base64Resolvable = Buffer | Uint8Array | string;

export interface ResolvedFile {
	data: Buffer | Uint8Array;
	contentType?: string;
}

/**
 * Resolves the string to a code based on the passed regex.
 *
 * @param {string} data The string to resolve
 * @param {RegExp} regex The RegExp used to extract the code
 * @returns {string}
 */
export function resolveCode(data: string, regex: RegExp): string {
	return regex.exec(data)?.[1] ?? data;
}

/**
 * Resolves InviteResolvable to an invite code.
 *
 * @param {InviteResolvable} data The invite resolvable to resolve
 * @returns {string}
 */
export function resolveInviteCode(data: InviteResolvable): string {
	return resolveCode(data, BaseInvite.InvitesPattern);
}

/**
 * Resolves GuildTemplateResolvable to a template code.
 *
 * @param {GuildTemplateResolvable} data The template resolvable to resolve
 * @returns {string}
 */
export function resolveGuildTemplateCode(data: GuildTemplateResolvable): string {
	return resolveCode(data, getGuildTemplate().GuildTemplatesPattern);
}

/**
 * Resolves a BufferResolvable to a Buffer.
 *
 * @param {BufferResolvable} resource The buffer or stream resolvable to resolve
 * @returns {Promise<ResolvedFile>}
 */
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

	if (typeof (resource as AsyncIterable<Uint8Array | ArrayBuffer | Buffer>)[Symbol.asyncIterator] === 'function') {
		const chunks: Uint8Array[] = [];
		let totalLen = 0;
		for await (const data of resource as AsyncIterable<Uint8Array | ArrayBuffer | Buffer>) {
			const chunk = data instanceof Uint8Array ? data : new Uint8Array(data);
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
			return { data: Buffer.from(await res.arrayBuffer()), contentType: res.headers.get('content-type') ?? undefined };
		}

		const bunFile = Bun.file(resource);
		if (!(await bunFile.exists())) throw new DiscordjsError(ErrorCodes.FileNotFound, resource);
		return { data: Buffer.from(await bunFile.arrayBuffer()) };
	}

	throw new DiscordjsTypeError(ErrorCodes.ReqResourceType);
}

/**
 * Resolves a Base64Resolvable to a Base 64 string.
 *
 * @param {Base64Resolvable} data The base 64 resolvable you want to resolve
 * @param {string} [contentType='image/jpg'] The content type of the data
 * @returns {string}
 */
export function resolveBase64(data: Base64Resolvable, contentType = 'image/jpg'): string {
	if (Buffer.isBuffer(data)) return `data:${contentType};base64,${data.toString('base64')}`;
	if (data instanceof Uint8Array) return `data:${contentType};base64,${Buffer.from(data).toString('base64')}`;
	return data;
}

/**
 * Resolves a Base64Resolvable, a string, or a BufferResolvable to a Base 64 image.
 *
 * @param {BufferResolvable|Base64Resolvable} image The image to be resolved
 * @returns {Promise<?string>}
 */
export async function resolveImage(
	image: BufferResolvable | Base64Resolvable | null | undefined,
): Promise<string | null> {
	if (!image) return null;
	if (typeof image === 'string' && image.startsWith('data:')) {
		return image;
	}

	const file = await resolveFile(image);
	return resolveBase64(file.data);
}
