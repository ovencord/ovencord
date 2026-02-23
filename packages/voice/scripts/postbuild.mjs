const data = await Bun.file('./dist/index.mjs').text();
await Bun.write(
	'./dist/index.mjs',
	`import { createRequire as topLevelCreateRequire } from "module";
const require = topLevelCreateRequire(import.meta.url);
${data}`,
);
