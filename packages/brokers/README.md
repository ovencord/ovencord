# @𝗼𝘃𝗲𝗻𝗰𝗼𝗿𝗱/𝗯𝗿𝗼𝗸𝗲𝗿𝘀

<div align="left">
	<p>
		<a href="https://discord.gg/ovencord"><img src="https://img.shields.io/badge/join_us-on_discord-5865F2?logo=discord&logoColor=white" alt="Discord server" /></a>
		<a href="https://www.npmjs.com/package/@ovencord/builders"><img src="https://img.shields.io/npm/v/@ovencord/brokers.svg?maxAge=3600" alt="npm version" /></a>
		<img src="https://saizu.dev/badge/@ovencord/brokers?type=install" alt="install size">
		<a href="https://github.com/ovencord/ovencord/actions"><img src="https://github.com/ovencord/ovencord/actions/workflows/ci.yml/badge.svg" alt="CI status" /></a>
	</p>
</div>
<div align="center">
	<p>
		<a href="https://ovencord.dev"><img src="https://github.com/ovencord.png" width="250" alt="ovencord" /></a>
	</p>
</div>

## **About**

`@ovencord/brokers` is a powerful set of message brokers

## Installation

**Bun 1.0.+ is required, but we recommend always using the most up-to-date version**

```sh
bun install @ovencord/brokers
```

## Example usage

### pub sub

```ts
// publisher.js
import { PubSubRedisBroker } from '@ovencord/brokers';
import Redis from 'ioredis';

// Considering this only pushes events, the group and name are not important.
const broker = new PubSubRedisBroker(new Redis(), { group: 'noop', name: 'noop' });

await broker.publish('test', 'Hello World!');
await broker.destroy();

// subscriber.js
import { PubSubRedisBroker } from '@ovencord/brokers';
import Redis from 'ioredis';

const broker = new PubSubRedisBroker(new Redis(), {
	// This is the consumer group name. You should make sure to not re-use this
	// across different applications in your stack, unless you absolutely know
	// what you're doing.
	group: 'subscribers',
	// With the assumption that this service will scale to more than one instance,
	// you MUST ensure `UNIQUE_CONSUMER_ID` is unique across all of them and
	// also deterministic (i.e. if instance-1 restarts, it should still be instance-1)
	name: `consumer-${UNIQUE_CONSUMER_ID}`,
});
broker.on('test', ({ data, ack }) => {
	console.log(data);
	void ack();
});

await broker.subscribe(['test']);
```

### RPC

```ts
// caller.js
import { RPCRedisBroker } from '@ovencord/brokers';
import Redis from 'ioredis';

const broker = new RPCRedisBroker(new Redis(), { group: 'noop', name: 'noop' });

console.log(await broker.call('testcall', 'Hello World!'));
await broker.destroy();

// responder.js
import { RPCRedisBroker } from '@ovencord/brokers';
import Redis from 'ioredis';

const broker = new RPCRedisBroker(new Redis(), {
	// Equivalent to the group/name in pubsub, refer to the previous example.
	group: 'responders',
	name: `consumer-${UNIQUE_ID}`,
});
broker.on('testcall', ({ data, ack, reply }) => {
	console.log('responder', data);
	void ack();
	void reply(`Echo: ${data}`);
});

await broker.subscribe(['testcall']);
```
