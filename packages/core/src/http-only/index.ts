export * from '../api/index.js';
export * from '../util/index.js';

export * from 'discord-api-types/v10';

/**
 * The {@link https://github.com/ovencord/ovencord/blob/main/packages/core#readme | @ovencord/core} version
 * that you are currently using.
 */
// This needs to explicitly be `string` so it is not typed as a "const string" that gets injected by esbuild
export const version = '[VI]{{inject}}[/VI]' as string;
