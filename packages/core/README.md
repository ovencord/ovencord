# @𝗼𝘃𝗲𝗻𝗰𝗼𝗿𝗱/𝗰𝗼𝗿𝗲

<div align="left">
	<p>
		<a href="https://discord.gg/ovencord"><img src="https://img.shields.io/badge/join_us-on_discord-5865F2?logo=discord&logoColor=white" alt="Discord server" /></a>
		<a href="https://www.npmjs.com/package/@ovencord/core"><img src="https://img.shields.io/npm/v/@ovencord/core.svg?maxAge=3600" alt="npm version" /></a>
		<img src="https://saizu.dev/badge/@ovencord/core?type=install" alt="install size">
		<a href="https://github.com/ovencord/ovencord/actions"><img src="https://github.com/ovencord/ovencord/actions/workflows/ci.yml/badge.svg" alt="CI status" /></a>
	</p>
</div>
<div align="center">
	<p>
		<a href="https://ovencord.dev"><img src="https://github.com/ovencord.png" width="250" alt="ovencord" /></a>
	</p>
</div>

## About

`@ovencord/core` is a thinly abstracted wrapper around the "core" components of the Discord API: REST, and gateway.

## Installation

**Bun 1.0.+ is required, but we recommend always using the most up-to-date version**

```sh
bun add @ovencord/core
```

## Example usage

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

