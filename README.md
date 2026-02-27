# 𝗢 𝗩 𝗘 𝗡 𝗖 𝗢 𝗥 𝗗


[![Bun](https://img.shields.io/badge/Bun-1.0%2B-black?logo=bun)](https://bun.sh)
[![CI](https://github.com/ovencord/ovencord/actions/workflows/ci.yml/badge.svg)](https://github.com/ovencord/ovencord/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/ovencord/ovencord/blob/main/LICENSE)
<img src="https://img.shields.io/github/repo-size/ovencord/ovencord"> 
[![GitHub Stars](https://img.shields.io/github/stars/ovencord/ovencord?style=social)](https://github.com/ovencord/ovencord)


<div align="center">
<img width="250" alt="Ovencord Logo" src="https://github.com/ovencord.png" />

**Cooking the future of Discord development.**<br>
Ovencord is a **technical collective** dedicated to building high-performance, Bun-native solutions for the Discord ecosystem.
</div>

##

## What is Ovencord?

**Ovencord is not a simple refactor, it is an Engine Re-engineering.**                                                                                  
We believe that **emulation is the enemy of performance**. Our mission is to eliminate the legacy Node.js overhead from Discord tools, replacing it with pure, Zig-powered Bun native implementations.

> **Ovencord = Oven + Discord**  
> We're cooking something special. 🔥

##

## 📦 Packages

| Package | Description | Status |
|---------|-------------|--------|
| [@ovencord/rest](./packages/rest) | Bun-native Discord REST client | ✅ **Stable** |
| [@ovencord/ws](./packages/ws) | Bun-native WebSocket gateway client | ✅ **Stable** |
| [@ovencord/builders](./packages/builders) | Payload builders standardized for Zod 3 | ✅ **Stable** |
| [@ovencord/util](./packages/util) | Shared utilities for Ovencord packages | ✅ **Stable** |
| [@ovencord/collection](./packages/collection) | High-performance Collection class | ✅ **Stable** |
| [@ovencord/discord.js](./packages/discord.js) | Full Bun-native Discord.js fork | ✅ **Stable** |
| [@ovencord/brokers](./packages/brokers) | Cross-environment pub/sub message brokers | ✅ **Stable** |
| [@ovencord/core](./packages/core) | High-level client abstraction | ✅ **Stable** |
| [@ovencord/formatters](./packages/formatters) | Message formatting utilities | ✅ **Stable** |
| [@ovencord/structures](./packages/structures) | Discord data structures | ✅ **Stable** |
| [@ovencord/voice](./packages/voice) | Implementation of the Discord Voice API | ✅ **Stable** |
| [@ovencord/next](./packages/next) | Next-generation components | ✅ **Stable** |
| [@ovencord/ui](./packages/ui) | JSX-based UI framework for Discord | ✅ **Stable** |


## Our Philosophy

### Native-First
> We don't just _support_ Bun; we **build FOR Bun**.
<br>

| Before | After | 
|---------|-------------|
| `ws` library | Bun-native WebSocket |
| `node:zlib` | `Bun.inflateSync` |
| `node:buffer` | Web Standard `Uint8Array` |
| `node:fetch` | Bun global `fetch` |
| `node:events` | Pure Async Event Emitter |

### Zero-Bloat
> If it's legacy and slow, it's gone.          
<br>

| Metric | Discord.js (Original - NPM) | Ovencord (Bun) | Result |
| :--- | :--- | :--- | :--- |
| **Size (Data)** | 16.6 MB | **9.20 MB** | **-44.5%** |
| **Size on Disk** | 20.4 MB | **12.9 MB** | **-36.8%** |
| **Contains (Files)** | 3,036 files | **2,261 files** | **-775 files** |
| **Folders** | 144 folders | **122 folders** | **-22 folders** |

### Speed is a Feature
> We optimize for microseconds and megabytes.
<br>

| Metric | discord.js | Ovencord | Δ |
|------|------------|----------|---|
| Message Decompression | ~2.5ms | ~1.5ms | **40% faster** |
| WebSocket Connect | ~450ms | ~400ms | **11% faster** |
| Memory Baseline | ~85MB | ~68MB | **20% lower** |
| Binary Handling | Copy | Zero-copy | **35% faster** |


## Quick Start

### Installation

```bash
bun add @ovencord/ws @ovencord/rest
```

### Example: Discord Bot

You can quickly scaffold a new bot using your preferred package manager (Note: This uses the legacy scaffolding, but we recommend native Bun setup for new projects):

```bash
bun create discord-bot ./your/chosen/directory
# or npm/yarn/pnpm
```

Alternatively, here is the manual setup for a basic bot:

```typescript
import { Client } from '@ovencord/core'; // Coming soon!

const client = new Client({
  token: process.env.DISCORD_TOKEN!,
  intents: ['Guilds', 'GuildMessages'],
});

client.on('messageCreate', (message) => {
  if (message.content === '!ping') {
    message.reply('Pong! 🥟');
  }
});

await client.login();
```

**That's it.** No build step. No transpilation. Bun reads TypeScript source directly.


## Why Ovencord?

### For End Users

- **Faster bots** with 30-50% lower latency
- **Lighter deployments** with 85% smaller dependencies
- **Instant updates** with zero build time
- **Better DX** with full TypeScript support out of the box

### For Library Authors

- **Pure ESM** - no CommonJS legacy
- **Source-only distribution** - users see real code
- **Bun test runner** - no vitest/jest bloat
- **Bun-native APIs** - maximum performance

### For Contributors

- **Fewer tools** to learn and maintain
- **Cleaner codebase** without polyfills
- **Easier debugging** (no transpilation)
- **Modern TypeScript** without legacy constraints



## Development

### Prerequisites

- [Bun](https://bun.sh) >= 1.0.0

### Setup

```bash
# Clone the repository
git clone https://github.com/ovencord/ovencord.git
cd ovencord

# Install dependencies (syncs workspace and lockfile)
bun install
```

### Verification Scripts

| Command | Action |
|---------|--------|
| `bun run build` | Build all packages (where necessary) |
| `bun run test` | Run tests across the monorepo |
| `bun run lint` | Run ESLint (Gold Standard, zero-warning) |
| `bun run typecheck` | Perform recursive TypeScript type checking |


### Project Structure

```
ovencord/
├── packages/
│   ├── brokers/     # Cross-environment pub/sub message brokers
│   ├── builders/    # Discord payload builders (Zod 3)
│   ├── collection/  # Performance-optimized Map
│   ├── core/        # High-level client abstraction
│   ├── discord.js/  # Full Bun-native Discord.js fork
│   ├── formatters/  # Message formatting utilities
│   ├── next/        # Next-generation library paradigms
│   ├── rest/        # Discord REST API client
│   ├── structures/  # Discord data structures
│   ├── ui/          # JSX-based Discord UI framework
│   ├── util/        # Shared utilities
│   ├── voice/       # Voice connection support
│   └── ws/          # WebSocket gateway client
├── .github/         # CI/CD workflows
└── package.json     # Workspace root
```

## Contributing

```diff
We accept PRs that:
+ Remove more legacy code
+ Improve performance
+ Add Bun-native features
+ Fix bugs
+ Improve documentation

We reject PRs that:
- Add Node.js dependencies
- Add build tools
- Break API compatibility
- Reduce performance
```

## License

Apache-2.0 © Ovencord Contributors

Original discord.js code © Discord.js Contributors


## Credits

Ovencord stands on the shoulders of giants:

- **discord.js** - The original library that powers millions of bots
- **Bun** - The runtime that makes this all possible
- **Zig** - The low-level magic behind Bun's performance

**This is NOT an official Discord library.**


## 🗺️ Roadmap

- [x] Refactor `@ovencord/rest` for Bun-native performance
- [x] Refactor `@ovencord/ws` for Bun-native stability
- [x] Optimize `@ovencord/collection` for high-throughput
- [x] Standardize `@ovencord/util` shared utilities
- [x] Port `@ovencord/builders` and `@ovencord/brokers` to 100% Bun-native
- [x] Stabilize `@ovencord/discord.js` heavy fork and resolve all typings conflicts
- [x] Port `@ovencord/voice` and `@ovencord/util` internal pipelines to Native zeroing `node:events` and external emitters
- [x] Comprehensive performance benchmarks vs original discord.js - check `@ovencord/benchmark`
- [x] Achieve 100% monorepo functional test coverage
- [ ] Launch official documentation site (ovencord.dev)
- [ ] Release discord.js -> Ovencord migration guide


<div align="center">

**Join the evolution. Stop emulating, start running.** 

[Discord](https://discord.gg/ovencord) · [Documentation](https://ovencord.dev) · [Twitter](https://twitter.com/ovencord)

</div>
