# @𝗼𝘃𝗲𝗻𝗰𝗼𝗿𝗱/𝗯𝗿𝗼𝗸𝗲𝗿𝘀

[![Bun](https://img.shields.io/badge/Bun-1.0%2B-black?logo=bun)](https://bun.sh)
[![CI](https://github.com/ovencord/ovencord/actions/workflows/ci.yml/badge.svg)](https://github.com/ovencord/ovencord/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/ovencord/ovencord/blob/main/LICENSE)
<img src="https://img.shields.io/github/repo-size/ovencord/ovencord"> 
[![GitHub Stars](https://img.shields.io/github/stars/ovencord/ovencord?style=social)](https://github.com/ovencord/ovencord)


<div align="center">
<img width="250" alt="Ovencord Logo" src="https://github.com/ovencord.png" />
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
