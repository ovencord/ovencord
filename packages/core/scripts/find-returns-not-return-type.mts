const cwd = import.meta.dir + '/../src/api/';
const results: string[] = [];
const glob = new Bun.Glob('**/*.ts');

for await (const file of glob.scan({ cwd })) {
	const content = await Bun.file(`${cwd}${file}`).text();

	const matches = content.matchAll(/as Promise<(?<returnType>\w+)>/g);

	for (const match of matches) {
		const returnType = match.groups!.returnType!;

		if (!returnType.startsWith('REST') || !returnType.includes('Result')) {
			results.push(`in file core/src/api/${file}: ${returnType}`);
		}
	}
}

if (results.length > 0) {
	console.warn('Found return types that are not REST return types:');

	for (const result of results) {
		console.warn(`  - ${result}`);
	}
} else {
	console.log('No return types that are not REST return types found');
}
