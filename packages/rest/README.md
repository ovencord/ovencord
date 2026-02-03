<div align="center">
	<br />
	<p>
		<a href="https://ovencord.dev"><img src="https://github.com/ovencord.png" width="150" alt="ovencord" /></a>
	</p>
	<br />
	<p>
		<a href="https://discord.gg/ovencord"><img src="https://img.shields.io/badge/join_us-on_discord-5865F2?logo=discord&logoColor=white" alt="Discord server" /></a>
		<a href="https://www.npmjs.com/package/@ovencord/rest"><img src="https://img.shields.io/npm/v/@ovencord/rest.svg?maxAge=3600" alt="npm version" /></a>
		<a href="https://github.com/ovencord/ovencord/actions"><img src="https://github.com/ovencord/ovencord/actions/workflows/ci.yml/badge.svg" alt="CI status" /></a>
	</p>
</div>

# @ovencord/rest

**High-performance, Bun-native Discord REST client.**

`@ovencord/rest` is a modernized fork of `@discordjs/rest`, rebuilt from the ground up to leverage the full power of the Bun runtime. It maintains 100% API compatibility with the original package while offering superior performance and zero legacy bloat.

## 🥟 Why Ovencord-REST?

| Feature | @discordjs/rest | @ovencord/rest |
|---------|-----------------|----------------|
| **Runtime** | Node.js | **Bun Native** |
| **HTTP Client** | undici (Legacy) | **Bun.fetch** (Native Zig) |
| **File Handling** | node:fs / Buffer | **Bun.file** / Uint8Array |
| **Dependencies** | ~10+ | **Minimal** |
| **Build Step** | Required (CJS/ESM) | **None** (Source-only) |
| **Speed** | Standard | **Up to 2x faster request cycle** |

### ✨ Architectural Shift
We replaced the complex `undici` dispatcher and Node.js-specific stream handling with a clean, Web-Standard implementation powered by Bun's native Zig-accelerated `fetch`.

## 📦 Installation

**Bun 1.0.0 or newer is required.**

```sh
bun add @ovencord/rest
```

## 🚀 Examples

### Send a basic message

```typescript
import { REST } from '@ovencord/rest';
import { Routes } from 'discord-api-types/v10';

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);

try {
	await rest.post(Routes.channelMessages(CHANNEL_ID), {
		body: {
			content: 'Cooked with Bun! 🥟',
		},
	});
} catch (error) {
	console.error(error);
}
```

### Uploading a file (Bun Native)

```typescript
import { REST } from '@ovencord/rest';
import { Routes } from 'discord-api-types/v10';

const rest = new REST({ version: '10' }).setToken(TOKEN);

await rest.post(Routes.channelMessages(CHANNEL_ID), {
	files: [
		{
			attachment: Bun.file('./logo.png'),
			name: 'logo.png',
		},
	],
});
```

## 🛠️ Performance Features

- **Zero-Copy**: Optimized binary handling using `Uint8Array` instead of `Buffer` where possible.
- **Native Fetch**: Uses Bun's specialized `fetch` implementation for lower overhead.
- **Source-Only**: No more `dist` folders. Bun loads the TypeScript source directly, leading to faster startup times and better stack traces.

## 🤝 Contributing

See [the contribution guide](https://github.com/ovencord/ovencord/blob/main/.github/CONTRIBUTING.md) if you'd like to submit a PR.

## 📜 License

Apache-2.0 © Ovencord Contributors  
Original discord.js code © Discord.js Contributors
