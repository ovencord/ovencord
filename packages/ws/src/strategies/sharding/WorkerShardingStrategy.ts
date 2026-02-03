import { Collection } from '@ovencord/collection';
import type { GatewaySendPayload } from 'discord-api-types/v10';
import type { SessionInfo, WebSocketManager } from '../../ws/WebSocketManager.js';
import { IShardingStrategy } from './IShardingStrategy.js';
import { WebSocketShardStatus } from '../../ws/WebSocketShard.js';

export interface WorkerShardingStrategyOptions {
	shardCount: number;
	workerPath: string;
	workerData?: unknown;
}

export class WorkerShardingStrategy implements IShardingStrategy {
	private readonly manager: WebSocketManager;

	private readonly options: WorkerShardingStrategyOptions;

	private readonly workers = new Collection<number, Worker>();

	public constructor(manager: WebSocketManager, options: WorkerShardingStrategyOptions) {
		this.manager = manager;
		this.options = options;
	}


	public async spawn(shardIds: number[]) {
		for (const shardId of shardIds) {
			const worker = new Worker(this.options.workerPath, {
				// Bun workers do not support workerData in the constructor like Node.js
				// We pass it via postMessage immediately after creation
			} as WorkerOptions);

			// Initialize worker with data
			worker.postMessage({
				op: 'initial_data',
				data: {
					...(this.options.workerData as object),
					shardId,
					shardCount: this.options.shardCount,
				},
			});

			worker.addEventListener('message', (event) => {
				this.onMessage(shardId, event.data);
			});

			worker.addEventListener('error', (err) => {
				console.error(`Worker for shard ${shardId} encountered an error:`, err);
			});

			this.workers.set(shardId, worker);
			await this.waitForReady(shardId);
		}
	}

	public async connect() {
		const promises = [];

		for (const [shardId, worker] of this.workers) {
			const payload: WorkerSendPayload = {
				op: WorkerSendPayloadOp.Connect,
				d: { shardId },
			};
			worker.postMessage(payload);
			promises.push(this.waitForReady(shardId));
		}

		await Promise.all(promises);
	}

	public destroy(options?: { code?: number; reason?: string }) {
		for (const worker of this.workers.values()) {
			const payload: WorkerSendPayload = {
				op: WorkerSendPayloadOp.Destroy,
				d: { shardId: 0, options }, // shardId is ignored for destroy usually, or broadcast
			};
			worker.postMessage(payload);
            // In Bun/Web Workers, we might want to terminate() if we are destroying everything
			worker.terminate();
		}
	}

	public send(shardId: number, payload: GatewaySendPayload) {
		const worker = this.workers.get(shardId);
		if (!worker) return;

		const workerPayload: WorkerSendPayload = {
			op: WorkerSendPayloadOp.Send,
			d: { shardId, payload },
		};
		worker.postMessage(workerPayload);
	}

	public async fetchSessionInfo(shardId: number): Promise<SessionInfo | null> {
		const worker = this.workers.get(shardId);
		if (!worker) return null;

		const nonce = Math.random();
		const payload: WorkerSendPayload = {
			op: WorkerSendPayloadOp.FetchSessionInfo,
			d: { shardId, nonce },
		};

		// We need a way to wait for response. 
        // This is tricky with raw event listeners without a request/response correlation helper.
        // For simplicity in this migration, we assume a fire-and-forget or need to implement a one-off listener.
        // Since we are moving to Bun, we can use a temporary promise.
        
        return new Promise((resolve, reject) => {
            const listener = (event: MessageEvent) => {
                const data = event.data as WorkerReceivePayload;
                if (data.op === WorkerReceivePayloadOp.SessionInfoResponse && data.d.nonce === nonce) {
                    worker.removeEventListener('message', listener);
                    resolve(data.d.session);
                }
            };
            
            // Timeout to prevent hanging
            const timeout = setTimeout(() => {
                worker.removeEventListener('message', listener);
                resolve(null);
            }, 5000);

            worker.addEventListener('message', listener);
            worker.postMessage(payload);
        });
	}

	public async fetchShardIdentity(shardId: number): Promise<number | null> {
		const worker = this.workers.get(shardId);
		if (!worker) return null;

        const nonce = Math.random();
		const payload: WorkerSendPayload = {
			op: WorkerSendPayloadOp.FetchShardIdentity,
			d: { shardId, nonce },
		};
        
        return new Promise((resolve) => {
            const listener = (event: MessageEvent) => {
                const data = event.data as WorkerReceivePayload;
                if (data.op === WorkerReceivePayloadOp.ShardIdentityResponse && data.d.nonce === nonce) {
                    worker.removeEventListener('message', listener);
                    resolve(data.d.shardId);
                }
            };
            worker.addEventListener('message', listener);
            worker.postMessage(payload);
        });
	}

	public async fetchStatus(): Promise<Collection<number, WebSocketShardStatus>> {
        const statuses = new Collection<number, WebSocketShardStatus>();
        const promises: Promise<void>[] = [];

        for (const [shardId, worker] of this.workers) {
            const nonce = Math.random();
            const payload: WorkerSendPayload = {
                op: WorkerSendPayloadOp.FetchStatus,
                d: { shardId, nonce },
            };
            
            const promise = new Promise<void>((resolve) => {
                const listener = (event: MessageEvent) => {
                    const data = event.data as WorkerReceivePayload;
                    if (data.op === WorkerReceivePayloadOp.StatusResponse && data.d.nonce === nonce) {
                        worker.removeEventListener('message', listener);
                        statuses.set(shardId, data.d.status);
                        resolve();
                    }
                };
                
                // Timeout to prevent hanging
                setTimeout(() => {
                    worker.removeEventListener('message', listener);
                    resolve();
                }, 5000);

                worker.addEventListener('message', listener);
                worker.postMessage(payload);
            });
            
            promises.push(promise);
        }

        await Promise.all(promises);
        return statuses;
	}

	private onMessage(shardId: number, payload: WorkerReceivePayload) {
		switch (payload.op) {
			case WorkerReceivePayloadOp.Connect:
				// handled by spawn
				break;
			case WorkerReceivePayloadOp.Destroy:
				// handled by destroy
				break;
			case WorkerReceivePayloadOp.Send:
				// handled by send
				break;
			case WorkerReceivePayloadOp.SessionInfoResponse:
                // Handled by fetchSessionInfo promise
				break;
			case WorkerReceivePayloadOp.ShardIdentityResponse:
                // Handled by fetchShardIdentity promise
				break; 
            case WorkerReceivePayloadOp.Event:
                this.manager.emit(payload.d.event, ...payload.d.args || []);
                break;
		}
	}

	private async waitForReady(shardId: number) {
		// Implementation depends on how we signal ready.
        // Assuming we receive a 'Ready' event forwarded from the worker.
	}
}

export enum WorkerSendPayloadOp {
	Connect,
	Destroy,
	Send,
	FetchSessionInfo,
	FetchShardIdentity,
	FetchStatus,
    Event,
}

export enum WorkerReceivePayloadOp {
	Connect,
	Destroy,
	Send,
	SessionInfoResponse,
	ShardIdentityResponse,
	StatusResponse,
    Event,
}

export interface WorkerSendPayload {
	op: WorkerSendPayloadOp;
	d: any;
}

export interface WorkerReceivePayload {
	op: WorkerReceivePayloadOp;
	d: any;
}
