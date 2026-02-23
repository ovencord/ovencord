import { AsyncEventEmitter } from '@ovencord/util';
import type { VoiceSendPayload } from 'discord-api-types/voice/v8';
import { VoiceOpcodes } from 'discord-api-types/voice/v8';

/**
 * A binary WebSocket message.
 */
export interface BinaryWebSocketMessage {
	op: VoiceOpcodes;
	payload: Uint8Array;
	seq: number;
}

export interface VoiceWebSocket extends AsyncEventEmitter {
	on(event: 'error', listener: (error: Error) => void): this;
	on(event: 'open', listener: (event: Event) => void): this;
	on(event: 'close', listener: (event: CloseEvent) => void): this;
	/**
	 * Debug event for VoiceWebSocket.
	 *
	 * @eventProperty
	 */
	on(event: 'debug', listener: (message: string) => void): this;
	/**
	 * Packet event.
	 *
	 * @eventProperty
	 */
	on(event: 'packet', listener: (packet: any) => void): this;
	/**
	 * Binary message event.
	 *
	 * @eventProperty
	 */
	on(event: 'binary', listener: (message: BinaryWebSocketMessage) => void): this;
}

/**
 * An extension of the WebSocket class to provide helper functionality when interacting
 * with the Discord Voice gateway.
 */
export class VoiceWebSocket extends AsyncEventEmitter {
	/**
	 * The current heartbeat interval, if any.
	 */
	private heartbeatInterval?: NodeJS.Timeout;

	/**
	 * The time (milliseconds since UNIX epoch) that the last heartbeat acknowledgement packet was received.
	 * This is set to 0 if an acknowledgement packet hasn't been received yet.
	 */
	private lastHeartbeatAck: number;

	/**
	 * The time (milliseconds since UNIX epoch) that the last heartbeat was sent. This is set to 0 if a heartbeat
	 * hasn't been sent yet.
	 */
	private lastHeartbeatSend: number;

	/**
	 * The number of consecutively missed heartbeats.
	 */
	private missedHeartbeats = 0;

	/**
	 * The last recorded ping.
	 */
	public ping?: number;

	/**
	 * The last sequence number acknowledged from Discord. Will be `-1` if no sequence numbered messages have been received.
	 */
	public sequence = -1;

	/**
	 * The debug logger function, if debugging is enabled.
	 */
	private readonly debug: ((message: string) => void) | null;

	/**
	 * The underlying WebSocket of this wrapper.
	 */
	private readonly ws: WebSocket;

	/**
	 * Creates a new VoiceWebSocket.
	 *
	 * @param address - The address to connect to
	 */
	public constructor(address: string, debug: boolean) {
		super();
		this.ws = new WebSocket(address);
		this.ws.binaryType = 'arraybuffer';
		this.ws.onmessage = (event) => this.onMessage(event);
		this.ws.onopen = (event) => this.emit('open', event);
		this.ws.onerror = (event) => this.emit('error', new Error('WebSocket encountered an error'));
		this.ws.onclose = (event) => this.emit('close', event);

		this.lastHeartbeatAck = 0;
		this.lastHeartbeatSend = 0;

		this.debug = debug ? (message: string) => this.emit('debug', message) : null;
	}

	/**
	 * Destroys the VoiceWebSocket. The heartbeat interval is cleared, and the connection is closed.
	 */
	public destroy() {
		try {
			this.debug?.('destroyed');
			this.setHeartbeatInterval(-1);
			this.ws.close(1_000);
		} catch (error) {
			const err = error as Error;
			this.emit('error', err);
		}
	}

	/**
	 * Handles message events on the WebSocket. Attempts to JSON parse the messages and emit them
	 * as packets. Binary messages will be parsed and emitted.
	 *
	 * @param event - The message event
	 */
	public onMessage(event: MessageEvent) {
		if (event.data instanceof Buffer || event.data instanceof ArrayBuffer || event.data instanceof Uint8Array) {
			const buffer =
				event.data instanceof ArrayBuffer
					? new Uint8Array(event.data)
					: event.data instanceof Uint8Array
						? event.data
						: new Uint8Array(event.data);

			const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
			const seq = view.getUint16(0, false);
			const op = view.getUint8(2);
			const payload = buffer.subarray(3);

			this.sequence = seq;
			this.debug?.(`<< [bin] opcode ${op}, seq ${seq}, ${payload.byteLength} bytes`);

			this.emit('binary', { op, seq, payload });
			return;
		} else if (typeof event.data !== 'string') {
			return;
		}

		this.debug?.(`<< ${event.data}`);

		let packet: any;
		try {
			packet = JSON.parse(event.data);
		} catch (error) {
			const err = error as Error;
			this.emit('error', err);
			return;
		}

		if (packet.seq) {
			this.sequence = packet.seq;
		}

		if (packet.op === VoiceOpcodes.HeartbeatAck) {
			this.lastHeartbeatAck = Date.now();
			this.missedHeartbeats = 0;
			this.ping = this.lastHeartbeatAck - this.lastHeartbeatSend;
		}

		this.emit('packet', packet);
	}

	/**
	 * Sends a JSON-stringifiable packet over the WebSocket.
	 *
	 * @param packet - The packet to send
	 */
	public sendPacket(packet: VoiceSendPayload) {
		try {
			const stringified = JSON.stringify(packet);
			this.debug?.(`>> ${stringified}`);
			this.ws.send(stringified);
		} catch (error) {
			const err = error as Error;
			this.emit('error', err);
		}
	}

	/**
	 * Sends a binary message over the WebSocket.
	 *
	 * @param opcode - The opcode to use
	 * @param payload - The payload to send
	 */
	public sendBinaryMessage(opcode: VoiceOpcodes, payload: Uint8Array) {
		try {
			const message = new Uint8Array(1 + payload.length);
			message[0] = opcode;
			message.set(payload, 1);
			this.debug?.(`>> [bin] opcode ${opcode}, ${payload.byteLength} bytes`);
			this.ws.send(message);
		} catch (error) {
			const err = error as Error;
			this.emit('error', err);
		}
	}

	/**
	 * Sends a heartbeat over the WebSocket.
	 */
	private sendHeartbeat() {
		this.lastHeartbeatSend = Date.now();
		this.missedHeartbeats++;
		const nonce = this.lastHeartbeatSend;
		this.sendPacket({
			op: VoiceOpcodes.Heartbeat,
			d: {
				t: nonce,
				seq_ack: this.sequence,
			},
		});
	}

	/**
	 * Sets/clears an interval to send heartbeats over the WebSocket.
	 *
	 * @param ms - The interval in milliseconds. If negative, the interval will be unset
	 */
	public setHeartbeatInterval(ms: number) {
		if (this.heartbeatInterval !== undefined) clearInterval(this.heartbeatInterval);
		if (ms > 0) {
			this.heartbeatInterval = setInterval(() => {
				if (this.lastHeartbeatSend !== 0 && this.missedHeartbeats >= 3) {
					// Missed too many heartbeats - disconnect
					this.ws.close();
					this.setHeartbeatInterval(-1);
				}

				this.sendHeartbeat();
			}, ms);
		}
	}
}
