<div align="center">
	<br />
	<p>
		<a href="https://discord.js.org"><img src="https://discord.js.org/static/logo.svg" width="546" alt="discord.js" /></a>
	</p>
	<br />
	<p>
		<a href="https://discord.gg/djs"><img src="https://img.shields.io/badge/join_us-on_discord-5865F2?logo=discord&logoColor=white" alt="Discord server" /></a>
		<a href="https://www.npmjs.com/package/@ovencord/core"><img src="https://img.shields.io/npm/v/@ovencord/core.svg?maxAge=3600" alt="npm version" /></a>
		<a href="https://www.npmjs.com/package/@ovencord/core"><img src="https://img.shields.io/npm/dt/@ovencord/core.svg?maxAge=3600" alt="npm downloads" /></a>
		<a href="https://github.com/ovencord/ovencord/actions"><img src="https://github.com/ovencord/ovencord/actions/workflows/tests.yml/badge.svg" alt="Build status" /></a>
		<a href="https://github.com/ovencord/ovencord/commits/main/packages/core"><img alt="Last commit." src="https://img.shields.io/github/last-commit/ovencord/ovencord?logo=github&logoColor=ffffff&path=packages%2Fcore" /></a>
		<a href="https://opencollective.com/discordjs"><img src="https://img.shields.io/opencollective/backers/discordjs?maxAge=3600&logo=opencollective" alt="backers" /></a>
		<a href="https://codecov.io/gh/ovencord/ovencord"><img src="https://codecov.io/gh/ovencord/ovencord/branch/main/graph/badge.svg?precision=2&flag=core" alt="Code coverage" /></a>
	</p>
	<p>
		<a href="https://vercel.com/?utm_source=discordjs&utm_campaign=oss"><img src="https://raw.githubusercontent.com/ovencord/ovencord/main/.github/powered-by-vercel.svg" alt="Vercel" /></a>
		<a href="https://www.cloudflare.com"><img src="https://raw.githubusercontent.com/ovencord/ovencord/main/.github/powered-by-workers.png" alt="Cloudflare Workers" height="44" /></a>
	</p>
</div>

## About

`@ovencord/core` is a thinly abstracted wrapper around the "core" components of the Discord API: REST, and gateway.

## Installation

**Node.js 22.12.0 or newer is required.**

```sh
npm install @ovencord/core
yarn add @ovencord/core
pnpm add @ovencord/core
```

## Example usage

These examples use [ES modules](https://nodejs.org/api/esm.html#enabling).

```ts
import {
	Client,
	GatewayDispatchEvents,
	GatewayIntentBits,
	InteractionType,
	MessageFlags,
	type RESTGetAPIGatewayBotResult,
} from '@ovencord/core';
import { REST } from '@ovencord/rest';
import { WebSocketManager } from '@ovencord/ws';

// Create REST and WebSocket managers directly
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

const gateway = new WebSocketManager({
	token: process.env.DISCORD_TOKEN,
	intents: GatewayIntentBits.GuildMessages | GatewayIntentBits.MessageContent,
	fetchGatewayInformation: () => rest.get('/gateway/bot') as Promise<RESTGetAPIGatewayBotResult>,
});

// Create a client to emit relevant events.
const client = new Client({ rest, gateway });

// Listen for interactions
// Each event contains an `api` prop along with the event data that allows you to interface with the Discord REST API
client.on(GatewayDispatchEvents.InteractionCreate, async ({ data: interaction, api }) => {
	if (interaction.type !== InteractionType.ApplicationCommand || interaction.data.name !== 'ping') {
		return;
	}

	await api.interactions.reply(interaction.id, interaction.token, { content: 'Pong!', flags: MessageFlags.Ephemeral });
});

// Listen for the ready event
client.once(GatewayDispatchEvents.Ready, () => console.log('Ready!'));

// Start the WebSocket connection.
gateway.connect();
```

## Independent REST API Usage

```ts
import { API } from '@ovencord/core/http-only';
import { REST } from '@ovencord/rest';

// Create REST instance
const rest = new REST({ version: '10' }).setToken(token);

// Pass into API
const api = new API(rest);

// Fetch a guild using the API wrapper
const guild = await api.guilds.get('1234567891011');
```

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
[documentation]: https://discord.js.org/docs/packages/core/stable
[guide]: https://discordjs.guide
[guide-source]: https://github.com/ovencord/ovencord/tree/main/apps/guide
[guide-update]: https://discordjs.guide/legacy/additional-info/changes-in-v14
[discord]: https://discord.gg/djs
[discord-developers]: https://discord.gg/discord-developers
[source]: https://github.com/ovencord/ovencord/tree/main/packages/core
[npm]: https://www.npmjs.com/package/@ovencord/core
[related-libs]: https://discord.com/developers/docs/topics/community-resources#libraries
[contributing]: https://github.com/ovencord/ovencord/blob/main/.github/CONTRIBUTING.md
