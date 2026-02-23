import { Routes } from 'discord-api-types/v10';

const usedRoutes = new Set<string>();

const ignoredRoutes = new Set([
	// Deprecated
	'channelPins',
	'channelPin',
	'guilds',
	'guildCurrentMemberNickname',
	'guildMFA',
	'nitroStickerPacks',
]);

const cwd = `${import.meta.dir}/../src/api/`;
const glob = new Bun.Glob('**/*.ts');

for await (const file of glob.scan({ cwd })) {
	const content = await Bun.file(`${cwd}${file}`).text();

	const routes = content.matchAll(/Routes\.([\w\d_]+)/g);
	for (const route of routes) {
		usedRoutes.add(route[1]!);
	}
}

const unusedRoutes = Object.keys(Routes).filter((route) => !usedRoutes.has(route) && !ignoredRoutes.has(route));

if (unusedRoutes.length > 0) {
	console.warn('The following routes are not implemented:');
	for (const route of unusedRoutes) {
		console.warn(` - ${route}`);
	}
} else {
	console.log('No missing routes.');
}
