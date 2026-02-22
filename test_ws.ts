import { WebSocketShard, WebSocketShardEvents } from './packages/ws/src/ws/WebSocketShard.js';
import { SimpleContextFetchingStrategy } from './packages/ws/src/strategies/context/SimpleContextFetchingStrategy.js';
import { DefaultWebSocketManagerOptions } from './packages/ws/src/utils/constants.js';
import { WebSocketManager } from './packages/ws/src/ws/WebSocketManager.js';

async function run() {
    const wsManagerOptions = { ...DefaultWebSocketManagerOptions, token: 'mock-token', fetchGatewayInformation: async () => ({ session_start_limit: { max_concurrency: 1 } }) } as any;
    const manager = new WebSocketManager(wsManagerOptions);
    const strategy = new SimpleContextFetchingStrategy(manager, wsManagerOptions);
    const shard = new WebSocketShard(strategy, 0);

    shard.on(WebSocketShardEvents.HeartbeatComplete, (stats) => {
        console.log('HeartbeatComplete Emitted in Shard:', stats);
    });

    manager.on(WebSocketShardEvents.HeartbeatComplete, (stats, shardId) => {
        console.log('HeartbeatComplete received in Manager!', stats);
    });

    for (const event of Object.values(WebSocketShardEvents)) {
        shard.on(event as any, (...args: any[]) => manager.emit(event as any, ...args, 0));
    }

    // Mock sending heartbeat
    console.log('--- Triggering heartbeat() ---');
    shard['lastPingTimestamp'] = Number(Bun.nanoseconds());

    console.log('--- Triggering HeartbeatAck handler ---');
    await shard['onMessage'](JSON.stringify({ op: 11 }), false);

    console.log('Shard ping:', shard.ping);
}

run();
