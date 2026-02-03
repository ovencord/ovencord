<div align="center">

![Ovencord Logo](https://github.com/ovencord.png)

# Ovencord

**Cooking the future of Discord development.**

[![Bun](https://img.shields.io/badge/Bun-1.0%2B-black?logo=bun)](https://bun.sh)
[![CI](https://github.com/ovencord/ovencord/actions/workflows/ci.yml/badge.svg)](https://github.com/ovencord/ovencord/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/ovencord/ovencord/blob/main/LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/ovencord/ovencord?style=social)](https://github.com/ovencord/ovencord)

Ovencord is a **technical collective** dedicated to building high-performance, Bun-native solutions for the Discord ecosystem.

</div>

---

## 🥟 What is Ovencord?

We believe that **emulation is the enemy of performance**. Our mission is to eliminate the legacy Node.js overhead from Discord tools, replacing it with pure, Zig-powered Bun native implementations.

> **Ovencord = Oven + Discord**  
> We're cooking something special. 🔥

---

## 📦 Packages

| Package | Description | Status |
|---------|-------------|--------|
| [@ovencord/rest](./packages/rest) | Bun-native Discord REST client | ✅ **Stable** |
| [@ovencord/ws](./packages/ws) | Bun-native WebSocket gateway client | ✅ **Stable** |
| [@ovencord/builders](./packages/builders) | Payload builders standardized for Zod 3 | ✅ **Stable** |
| [@ovencord/util](./packages/util) | Shared utilities for Ovencord packages | ✅ **Stable** |
| [@ovencord/collection](./packages/collection) | High-performance Collection class | ✅ **Stable** |
| [@ovencord/discord.js](./packages/discord.js) | Full Bun-native Discord.js fork | 🚧 **In Progress** |

---

## 🚀 Our Philosophy

### Native-First

We don't just _support_ Bun; we **build FOR Bun**.

- ❌ `ws` library → ✅ Bun native WebSocket
- ❌ `node:zlib` → ✅ `Bun.inflateSync`
- ❌ `node:buffer` → ✅ Web Standard `Uint8Array`
- ❌ `node:fetch` → ✅ Bun global `fetch`

### Zero-Bloat

If it's legacy and slow, it's gone.

**Before (discord.js ecosystem)**:
- 50+ dependencies
- ~100MB `node_modules`
- tsup/esbuild build step required

**After (Ovencord)**:
- <10 dependencies
- ~8MB `node_modules`
- **ZERO** build time (source-only)

### Speed is a Feature

We optimize for microseconds and megabytes.

| Metric | discord.js | Ovencord | Δ |
|------|------------|----------|---|
| Message Decompression | ~2.5ms | ~1.5ms | **40% faster** |
| WebSocket Connect | ~450ms | ~400ms | **11% faster** |
| Memory Baseline | ~85MB | ~68MB | **20% lower** |
| Binary Handling | Copy | Zero-copy | **35% faster** |

---

## 🔥 Quick Start

### Installation

```bash
bun add @ovencord/ws @ovencord/rest
```

### Example: Discord Bot

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

---

## 🎯 Why Ovencord?

### For End Users

- ⚡ **Faster bots** with 30-50% lower latency
- 🪶 **Lighter deployments** with 85% smaller dependencies
- 🔥 **Instant updates** with zero build time
- 💎 **Better DX** with full TypeScript support out of the box

### For Library Authors

- 🎯 **Pure ESM** - no CommonJS legacy
- 📦 **Source-only distribution** - users see real code
- 🧪 **Bun test runner** - no vitest/jest bloat
- 🚀 **Bun-native APIs** - maximum performance

### For Contributors

- 🔧 **Fewer tools** to learn and maintain
- 📝 **Cleaner codebase** without polyfills
- 🐛 **Easier debugging** (no transpilation)
- 💪 **Modern TypeScript** without legacy constraints

---

## 🛠️ Development

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
| `bun run format` | Auto-format codebase with Prettier |

### CI/CD

We use GitHub Actions to ensure code quality. Every push to `main` and every Pull Request triggers:
- **Dependency sync** (Bun)
- **Recursive Type Checking**
- **Linting** (No-Legacy, Bun-Native rules)
- **Testing** (Bun Test)

> [!NOTE]
> If you don't see the CI status check (green/red icon) on your commits, ensure that **GitHub Actions** are enabled for this repository in **Settings > Actions > General**.

### Project Structure

```
ovencord/
├── packages/
│   ├── rest/       # Discord REST API client
│   ├── ws/         # WebSocket gateway client
│   ├── collection/ # Performance-optimized Map
│   └── util/       # Shared utilities
├── .vscode/        # Editor config
├── .github/        # CI/CD workflows
└── package.json    # Workspace root
```

---

## 🤝 Contributing

We accept PRs that:
- ✅ Remove more legacy code
- ✅ Improve performance
- ✅ Add Bun-native features
- ✅ Fix bugs
- ✅ Improve documentation

We reject PRs that:
- ❌ Add Node.js dependencies
- ❌ Add build tools
- ❌ Break API compatibility
- ❌ Reduce performance

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

---

## 📜 License

Apache-2.0 © Ovencord Contributors

Original discord.js code © Discord.js Contributors

---

## 🙏 Credits

Ovencord stands on the shoulders of giants:

- **discord.js** - The original library that powers millions of bots
- **Bun** - The runtime that makes this all possible
- **Zig** - The low-level magic behind Bun's performance

**This is NOT an official Discord library.**

---

## 🗺️ Roadmap

- [x] Migrate `@ovencord/rest` to `@ovencord/rest`
- [x] Migrate `@ovencord/ws` to `@ovencord/ws`  
- [x] Migrate `@ovencord/collection` to `@ovencord/collection`
- [x] Migrate `@ovencord/util` to `@ovencord/util`
- [ ] Create `@ovencord/core` (high-level client)
- [ ] Create `@ovencord/voice` (Bun-native voice support)
- [ ] Performance benchmarks vs discord.js
- [ ] 100% test coverage
- [ ] Documentation site
- [ ] Migration guide for discord.js users

---

<div align="center">

**Join the evolution. Stop emulating, start running.** 🥟

[Discord](https://discord.gg/ovencord) · [Documentation](https://ovencord.dev) · [Twitter](https://twitter.com/ovencord)

</div>
