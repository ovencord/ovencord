export * from './lib/CDN.js';
export * from './lib/errors/DiscordAPIError.js';
export * from './lib/errors/HTTPError.js';
export * from './lib/errors/RateLimitError.js';
export type * from './lib/interfaces/Handler.js';
export * from './lib/REST.js';
export * from './lib/utils/constants.js';
export * from './lib/utils/types.js';
export { calculateUserDefaultAvatarIndex, makeURLSearchParams, parseResponse } from './lib/utils/utils.js';

/**
 * The {@link https://github.com/ovencord/ovencord/blob/main/packages/rest#readme | @ovencord/rest} version
 * that you are currently using.
 */
// This needs to explicitly be `string` so it is not typed as a "const string" that gets injected by esbuild
export const version = '[VI]{{inject}}[/VI]' as string;
