import { Client, GatewayIntentBits } from './packages/discord.js/src/index.js';

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

console.log(client.ws.ping);

client.ws.emit('heartbeat', { heartbeatAt: Date.now() - 50, latency: 50 }, 0);

console.log(client.ws.ping);
console.log(client.ping);
