<div align="center">
	<br />
	<p>
		<a href="https://ovencord.dev"><img src="https://github.com/ovencord.png" width="150" alt="ovencord" /></a>
	</p>
	<br />
	<p>
		<a href="https://discord.gg/ovencord"><img src="https://img.shields.io/badge/join_us-on_discord-5865F2?logo=discord&logoColor=white" alt="Discord server" /></a>
		<a href="https://www.npmjs.com/package/@ovencord/builders"><img src="https://img.shields.io/npm/v/@ovencord/builders.svg?maxAge=3600" alt="npm version" /></a>
		<a href="https://github.com/ovencord/ovencord/actions"><img src="https://github.com/ovencord/ovencord/actions/workflows/ci.yml/badge.svg" alt="CI status" /></a>
	</p>
</div>

# @ovencord/builders

**High-performance payload builders, standardized for Zod 3 and Bun.**

`@ovencord/builders` is a modernized utility package for building Discord API payloads. Rebuilt for Bun, it eliminates legacy Zod v2 constraints and fixes long-standing multi-inheritance issues in TypeScript.

## 🥟 Why Ovencord-Builders?

| Feature | @ovencord/builders | @ovencord/builders |
|---------|---------------------|--------------------|
| **Validation** | Zod v2 (Legacy) | **Zod v3+ Standard** |
| **Inheritance** | Fragmented Mixins | **Fixed Interface Merging** |
| **Performance** | Standard | **Memory-optimized schemas** |
| **TypeScript** | Basic | **Strict & Highly Inferential** |
| **Build Step** | Required | **Zero** (Source-only) |

### ✨ Technical Optimizations
- **Zod 3 Native**: All schemas have been refactored to use native Zod 3 features like `z.nativeEnum()`, `z.string().url()`, and `superRefine`, resulting in faster validation cycles and better error messages.
- **Mixin Clarity**: Resolved `ts-mixer` visibility issues. Methods like `.toJSON()` are now properly exposed through interface merging, ensuring a seamless developer experience.
- **Uint8Array Support**: Native support for Web Standard `Uint8Array` in attachments, reducing `Buffer` overhead.

## 📦 Installation

**Bun 1.0.0 or newer is required.**

```sh
bun add @ovencord/builders
```

## 🚀 Examples

### Build a Chat Input Command

```typescript
import { SlashCommandBuilder } from '@ovencord/builders';

const command = new SlashCommandBuilder()
	.setName('ping')
	.setDescription('Replies with Pong!')
	.addStringOption(option =>
		option.setName('message')
			.setDescription('Optional message to echo')
			.setMaxLength(2000)
	);

console.log(command.toJSON());
```

### Create an Action Row with Buttons

```typescript
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from '@ovencord/builders';

const row = new ActionRowBuilder()
	.addComponents(
		new ButtonBuilder()
			.setCustomId('primary')
			.setLabel('Click Me')
			.setStyle(ButtonStyle.Primary),
		new ButtonBuilder()
			.setLabel('GitHub')
			.setURL('https://github.com/ovencord')
			.setStyle(ButtonStyle.Link)
	);
```

## 🛠️ Performance Features

- **Standardized Assertions**: Refactored assertions for maximum performance during serialization.
- **Source-Only Distribution**: No more `dist` folders. Bun loads the TypeScript source directly, making the package extremely lightweight (~1.5MB total vs ~15MB for discord.js).

## 🤝 Contributing

See [the contribution guide](https://github.com/ovencord/ovencord/blob/main/.github/CONTRIBUTING.md) if you'd like to submit a PR.

## 📜 License

Apache-2.0 © Ovencord Contributors  
Original discord.js code © Discord.js Contributors
