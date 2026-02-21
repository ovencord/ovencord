
import { lazy } from '@ovencord/util';
import { DiscordjsError, DiscordjsTypeError, ErrorCodes } from '../errors/index.js';
import { BaseInvite } from '../structures/BaseInvite.js';

// Fixes circular dependencies.
const getGuildTemplate = lazy(() => require('../structures/GuildTemplate.js').GuildTemplate);

/**
 * Data that can be resolved to give an invite code. This can be:
 * - An invite code
 * - An invite URL
 *
 * @typedef {string} InviteResolvable
 */

/**
 * Data that can be resolved to give a template code. This can be:
 * - A template code
 * - A template URL
 *
 * @typedef {string} GuildTemplateResolvable
 */

/**
 * Resolves the string to a code based on the passed regex.
 *
 * @param {string} data The string to resolve
 * @param {RegExp} regex The RegExp used to extract the code
 * @returns {string}
 */
export function resolveCode(data: any, regex: any) {
  return regex.exec(data)?.[1] ?? data;
}

/**
 * Resolves InviteResolvable to an invite code.
 *
 * @param {InviteResolvable} data The invite resolvable to resolve
 * @returns {string}
 */
export function resolveInviteCode(data: any) {
  return resolveCode(data, BaseInvite.InvitesPattern);
}

/**
 * Resolves GuildTemplateResolvable to a template code.
 *
 * @param {GuildTemplateResolvable} data The template resolvable to resolve
 * @returns {string}
 */
export function resolveGuildTemplateCode(data: any) {
  return resolveCode(data, getGuildTemplate().GuildTemplatesPattern);
}

/**
 * Data that can be resolved to give a Buffer. This can be:
 * - A Buffer
 * - The path to a local file
 * - A URL <warn>When provided a URL, discord.js will fetch the URL internally in order to create a Buffer.
 *   This can pose a security risk when the URL has not been sanitized</warn>
 *
 * @typedef {string|Buffer} BufferResolvable
 */

/**
 * @external Stream
 * @see {@link https://nodejs.org/api/stream.html}
 */

/**
 * @typedef {Object} ResolvedFile
 * @property {Buffer} data Buffer containing the file data
 * @property {string} [contentType] Content-Type of the file
 * @private
 */

/**
 * Resolves a BufferResolvable to a Buffer.
 *
 * @param {BufferResolvable|Stream} resource The buffer or stream resolvable to resolve
 * @returns {Promise<ResolvedFile>}
 */
export async function resolveFile(resource: any) {
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

  if (typeof resource[Symbol.asyncIterator] === 'function') {
    const chunks: Uint8Array[] = [];
    let totalLen = 0;
    for await (const data of resource) {
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
      return { data: Buffer.from(await res.arrayBuffer()), contentType: res.headers.get('content-type') };
    }

    const bunFile = Bun.file(resource);
    if (!await bunFile.exists()) throw new DiscordjsError(ErrorCodes.FileNotFound, resource);
    return { data: Buffer.from(await bunFile.arrayBuffer()) };
  }

  throw new DiscordjsTypeError(ErrorCodes.ReqResourceType);
}

/**
 * Data that resolves to give a Base64 string, typically for image uploading. This can be:
 * - A Buffer
 * - A base64 string
 *
 * @typedef {Buffer|string} Base64Resolvable
 */

/**
 * Resolves a Base64Resolvable to a Base 64 string.
 *
 * @param {Base64Resolvable} data The base 64 resolvable you want to resolve
 * @param {string} [contentType='image/jpg'] The content type of the data
 * @returns {string}
 */
export function resolveBase64(data: any, contentType = 'image/jpg') {
  if (Buffer.isBuffer(data)) return `data:${contentType};base64,${data.toString('base64')}`;
  return data;
}

/**
 * Resolves a Base64Resolvable, a string, or a BufferResolvable to a Base 64 image.
 *
 * @param {BufferResolvable|Base64Resolvable} image The image to be resolved
 * @returns {Promise<?string>}
 */
export async function resolveImage(image: any) {
  if (!image) return null;
  if (typeof image === 'string' && image.startsWith('data:')) {
    return image;
  }

  const file = await resolveFile(image);
  return resolveBase64(file.data);
}
