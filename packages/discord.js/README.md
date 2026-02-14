<div align="center">
	<p>
		<h1>@ovencord/discord.js</h1>
	</p>
	<br />
	<p>
		<a href="https://www.npmjs.com/package/@ovencord/discord.js"><img src="https://img.shields.io/npm/v/@ovencord/discord.js.svg?maxAge=3600&label=version&color=f97316" alt="npm version" /></a>
		<a href="https://www.npmjs.com/package/@ovencord/discord.js"><img src="https://img.shields.io/npm/dt/@ovencord/discord.js.svg?maxAge=3600&color=22c55e" alt="npm downloads" /></a>
		<a href="https://github.com/ovencord/ovencord/commits/main/packages/discord.js"><img alt="Last commit" src="https://img.shields.io/github/last-commit/ovencord/ovencord?logo=github&logoColor=ffffff&path=packages%2Fdiscord.js" /></a>
		<a href="https://github.com/ovencord/ovencord/blob/main/LICENSE"><img src="https://img.shields.io/github/license/ovencord/ovencord?color=6366f1" alt="License" /></a>
	</p>
		<p>
		<b>A high-performance, Bun-native re-engineering of the discord.js ecosystem.</b>
	</p>
		<p align="center">
  <img src="https://github.com/user-attachments/assets/a130ed79-3750-4973-a1d9-8a9e2b90a0a2" width="400">
</p>
</div>

---

## About

`@ovencord/discord.js` is a **Bun-native** library for interacting with the [Discord API](https://discord.com/developers/docs/intro). Not a wrapper. Not a polyfill layer. A ground-up re-engineering built to exploit every advantage that Bun's runtime provides.

- Object-oriented & fully typed
- Predictable, zero-magic abstractions
- Built on Zig-powered I/O — no Node.js legacy
- 100% coverage of the Discord API

> **Bun v1.0.0 or newer is required.**

---

## Why Ovencord?

We didn't fork discord.js to slap a new name on it. We gutted it, rewired it, and rebuilt the core around Bun's architecture. Here's what that means in practice:

### Zig-Powered I/O

Ovencord leverages Bun's native APIs — written in Zig and JavaScriptCore — for networking, file system access, and WebSocket connections. The result is raw throughput that Node.js simply cannot match.

### Ultra-low Memory Footprint

Up to **70% less RAM** than the original discord.js core. A bot running `@ovencord/discord.js` idles at **~27 MB** of memory. No bloat, no waste.

### Zero Node Bloat

We purged every unnecessary dependency inherited from the Node ecosystem:

- ❌ `tslib` — removed
- ❌ `fast-deep-equal` — removed
- ❌ `@sapphire/snowflake` — removed
- ❌ `zlib-sync`, `bufferutil` — unnecessary; Bun handles compression and WebSocket buffering natively and faster

No polyfills. No compatibility shims. Just clean, direct API calls.

### Native Sharding

Process management powered by `Bun.spawn` and the Web Worker API. Cold-start times are near-instant. Shard orchestration is handled natively without `child_process` or `worker_threads`.

---

## Installation

```sh
bun add @ovencord/discord.js
```

That's it. One runtime. One command.

---

## Example Usage

### Register a Slash Command

```ts
import { REST, Routes } from '@ovencord/discord.js';

const commands = [
  {
    name: 'ping',
    description: 'Replies with Pong!',
  },
];

const rest = new REST({ version: '10' }).setToken(TOKEN);

try {
  console.log('Started refreshing application (/) commands.');

  await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });

  console.log('Successfully reloaded application (/) commands.');
} catch (error) {
  console.error(error);
}
```

### Create a Bot

```ts
import { Client, Events, GatewayIntentBits } from '@ovencord/discord.js';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on(Events.ClientReady, readyClient => {
  console.log(`Logged in as ${readyClient.user.tag}!`);
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'ping') {
    await interaction.reply('Pong!');
  }
});

client.login(TOKEN);
```

---

## Links

- [GitHub](https://github.com/ovencord/ovencord/tree/main/packages/discord.js)
- [npm](https://www.npmjs.com/package/@ovencord/discord.js)
- [Issues](https://github.com/ovencord/ovencord/issues)
- [Discord Developers](https://discord.gg/discord-developers)

---

## Contributing

Before opening an issue, make sure it hasn't already been reported.
See the [contribution guide](https://github.com/ovencord/ovencord/blob/main/.github/CONTRIBUTING.md) if you'd like to submit a PR.

---

## License

Released under the [Apache-2.0](https://github.com/ovencord/ovencord/blob/main/LICENSE) license.

Built with 🔥 by the Ovencord contributors.
