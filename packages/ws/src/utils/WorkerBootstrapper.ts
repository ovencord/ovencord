import { Collection } from '@ovencord/collection';
import { WorkerContextFetchingStrategy } from '../strategies/context/WorkerContextFetchingStrategy.js';
import {
	WorkerReceivePayloadOp,
	WorkerSendPayloadOp,
} from '../strategies/sharding/WorkerShardingStrategy.js';
import { WebSocketManager } from '../ws/WebSocketManager.js';

// Define the global self explicitly for TypeScript as a Worker
declare const self: Worker;

let manager: WebSocketManager;

// Listen for messages from the main thread
self.addEventListener('message', async (event: MessageEvent) => {
	const message = event.data;

	// Initial setup if we receive the custom 'initial_data' op
	if (message && message.op === 'initial_data') {
		const { token, intents, rest, shardCount } = message.data;
		
		manager = new WebSocketManager(
			{
				token,
				intents,
				rest,
				buildStrategy: (manager) => new WorkerContextFetchingStrategy(manager),
				shardCount,
			},
		);

		await manager.connect();
		return;
	}

	// Handle standard protocol messages
	if (!message || typeof message.op === 'undefined') return;
	
	switch (message.op) {
		case WorkerSendPayloadOp.Connect: {
			const { shardId } = message.d;
			// For single-shard workers, we might just call connect on the manager?
            // The original logic seemed to delegate back to manager
			break;
		}

		case WorkerSendPayloadOp.Destroy: {
			const { options } = message.d;
			await manager.destroy(options);
			break;
		}

		case WorkerSendPayloadOp.Send: {
            // manager.send(shardId, payload); 
            // We need a way to send to specific shard if manager handles multiple, 
            // or if this worker IS the shard, just send.
            // Assuming 1 worker = 1 shard for now based on typical sharding strategy
			break;
		}

		case WorkerSendPayloadOp.FetchSessionInfo: {
            const { nonce } = message.d;
            // logic to get session
            const session = null; // Placeholder
            self.postMessage({
                op: WorkerReceivePayloadOp.SessionInfoResponse,
                d: { nonce, session }
            });
            break;
        }

        case WorkerSendPayloadOp.FetchShardIdentity: {
            const { nonce, shardId } = message.d;
            // logic to get identity
            self.postMessage({
                op: WorkerReceivePayloadOp.ShardIdentityResponse,
                d: { nonce, shardId }
            });
            break;
        }

		case WorkerSendPayloadOp.FetchStatus: {
			const { nonce } = message.d;
			// logic to get status usually requires checking the manager's shards logic
			// Assuming single shard per worker for now:
			// const status = manager.shards.get(shardId)?.status;
			const status = 0; // Placeholder: WebSocketShardStatus.Idle or similar
			self.postMessage({
				op: WorkerReceivePayloadOp.StatusResponse,
				d: { nonce, status }
			});
			break;
		}
	}
});


// We also need to forward events from the manager/shards BACK to the main thread
// This part requires hooking into the manager's events.
// Since we don't have the manager initialized immediately, we might need a distinct setup phase.
