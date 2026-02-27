# @𝗼𝘃𝗲𝗻𝗰𝗼𝗿𝗱/𝗳𝗼𝗿𝗺𝗮𝘁𝘁𝗲𝗿𝘀

<div align="left">
	<p>
		<a href="https://discord.gg/ovencord"><img src="https://img.shields.io/badge/join_us-on_discord-5865F2?logo=discord&logoColor=white" alt="Discord server" /></a>
		<a href="https://www.npmjs.com/package/@ovencord/formatters"><img src="https://img.shields.io/npm/v/@ovencord/formatters.svg?maxAge=3600" alt="npm version" /></a>
		<img src="https://saizu.dev/badge/@ovencord/formatters?type=install" alt="install size">
		<a href="https://github.com/ovencord/ovencord/actions"><img src="https://github.com/ovencord/ovencord/actions/workflows/ci.yml/badge.svg" alt="CI status" /></a>
	</p>
</div>
<div align="center">
	<p>
		<a href="https://ovencord.dev"><img src="https://github.com/ovencord.png" width="250" alt="ovencord" /></a>
	</p>
</div>

## About

`@ovencord/formatters` is a collection of functions for formatting strings to be used on Discord.

## Installation

**Node.js 22.12.0 or newer is required.**

```sh
npm install @ovencord/formatters
yarn add @ovencord/formatters
pnpm add @ovencord/formatters
bun add @ovencord/formatters
```

## Example usage

The example uses [ES modules](https://nodejs.org/api/esm.html#enabling).

````ts
import { codeBlock } from '@ovencord/formatters';

const formattedCode = codeBlock('hello world!');
console.log(formattedCode);

// Prints:
// ```
// hello world!
// ```
````

## Links

- [Website][website] ([source][website-source])
- [Documentation][documentation]
- [Guide][guide] ([source][guide-source])
  Also see the v13 to v14 [Update Guide][guide-update], which includes updated and removed items from the library.
- [discord.js Discord server][discord]
- [Discord Developers Discord server][discord-developers]
- [GitHub][source]
- [npm][npm]
- [Related libraries][related-libs]

## Contributing

Before creating an issue, please ensure that it hasn't already been reported/suggested, and double-check the
[documentation][documentation].  
See [the contribution guide][contributing] if you'd like to submit a PR.

## Help

If you don't understand something in the documentation, you are experiencing problems, or you just need a gentle nudge in the right direction, please don't hesitate to join our official [discord.js Server][discord].

[website]: https://discord.js.org
[website-source]: https://github.com/ovencord/ovencord/tree/main/apps/website
[documentation]: https://discord.js.org/docs/packages/formatters/stable
[guide]: https://discordjs.guide
[guide-source]: https://github.com/ovencord/ovencord/tree/main/apps/guide
[guide-update]: https://discordjs.guide/legacy/additional-info/changes-in-v14
[discord]: https://discord.gg/djs
[discord-developers]: https://discord.gg/discord-developers
[source]: https://github.com/ovencord/ovencord/tree/main/packages/formatters
[npm]: https://www.npmjs.com/package/@ovencord/formatters
[related-libs]: https://discord.com/developers/docs/topics/community-resources#libraries
[contributing]: https://github.com/ovencord/ovencord/blob/main/.github/CONTRIBUTING.md
