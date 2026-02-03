import {
	WorkerSendPayloadOp,
} from '../strategies/sharding/WorkerShardingStrategy.js';
import { WebSocketManager } from '../ws/WebSocketManager.js';
import { SimpleShardingStrategy } from '../strategies/sharding/SimpleShardingStrategy.js';

// Define the global self explicitly for TypeScript as a Worker
declare const self: Worker;

export class WorkerBootstrapper {
	private manager!: WebSocketManager;

	public async bootstrap() {
		// Listen for messages from the main thread
		self.addEventListener('message', async (event: MessageEvent) => {
			const message = event.data;

			// Initial setup if we receive the custom 'initial_data' op
			if (message && message.op === 'initial_data') {
				const { token, intents, shardCount } = message.data;
				
				this.manager = new WebSocketManager(
					{
						token,
						intents,
						buildStrategy: (manager: WebSocketManager) => new SimpleShardingStrategy(manager),
						shardCount,
						async fetchGatewayInformation() {
							// In a worker, we might need to fetch this from the main thread too, 
							// but manager usually handles it.
							// For now, satisfy the interface.
							return message.data.gatewayInformation;
						}
					} as any,
				);

				await this.manager.connect();
				return;
			}

			// Handle standard protocol messages
			if (!message || typeof message.op === 'undefined') return;
			
			switch (message.op) {
				case WorkerSendPayloadOp.Connect: {
					const { shardId: _shardId } = message.d;
					await this.manager.connect();
					break;
				}

				case WorkerSendPayloadOp.Destroy: {
					const { options } = message.d;
					await this.manager.destroy(options);
					break;
				}

				case WorkerSendPayloadOp.Send: {
					const { shardId, payload } = message.d;
					await this.manager.send(shardId, payload);
					break;
				}
			}
		});
	}
}
