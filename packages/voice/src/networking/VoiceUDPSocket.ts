import { AsyncEventEmitter } from '@ovencord/util';

type UDPSocket = Awaited<ReturnType<typeof Bun.udpSocket>>;

/**
 * Stores an IP address and port. Used to store socket details for the local client as well as
 * for Discord.
 */
export interface SocketConfig {
	ip: string;
	port: number;
}

/**
 * Parses the response from Discord to aid with local IP discovery.
 *
 * @param message - The received message
 */
export function parseLocalPacket(message: Uint8Array): SocketConfig {
	const view = new DataView(message.buffer, message.byteOffset, message.byteLength);

	let nullIndex = 8;
	while (nullIndex < message.length && message[nullIndex] !== 0) {
		nullIndex++;
	}

	const ipBytes = message.subarray(8, nullIndex);
	const ip = new TextDecoder().decode(ipBytes);

	const ipv4Regex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
	if (!ipv4Regex.test(ip)) {
		throw new Error('Malformed IP address');
	}

	const port = view.getUint16(message.length - 2, false);

	return { ip, port };
}

/**
 * The interval in milliseconds at which keep alive datagrams are sent.
 */
const KEEP_ALIVE_INTERVAL = 5e3;

/**
 * The maximum value of the keep alive counter.
 */
const MAX_COUNTER_VALUE = 2 ** 32 - 1;

export interface VoiceUDPSocket extends AsyncEventEmitter {
	on(event: 'error', listener: (error: Error) => void): this;
	on(event: 'close', listener: () => void): this;
	on(event: 'debug', listener: (message: string) => void): this;
	on(event: 'message', listener: (message: Uint8Array) => void): this;
}

/**
 * Manages the UDP networking for a voice connection.
 */
export class VoiceUDPSocket extends AsyncEventEmitter {
	/**
	 * The underlying network Socket for the VoiceUDPSocket.
	 */
	private socket?: any;

	/**
	 * The socket details for Discord (remote)
	 */
	private readonly remote: SocketConfig;

	/**
	 * The counter used in the keep alive mechanism.
	 */
	private keepAliveCounter = 0;

	/**
	 * The buffer used to write the keep alive counter into.
	 */
	private readonly keepAliveBuffer: Uint8Array;

	/**
	 * The DataView for writing to the keep alive buffer.
	 */
	private readonly keepAliveView: DataView;

	/**
	 * The interval for the keep-alive mechanism.
	 */
	private keepAliveInterval?: ReturnType<typeof setInterval>;

	/**
	 * The time taken to receive a response to keep alive messages.
	 *
	 * @deprecated This field is no longer updated as keep alive messages are no longer tracked.
	 */
	public ping?: number;

	/**
	 * Creates a new VoiceUDPSocket.
	 *
	 * @param remote - Details of the remote socket
	 */
	public constructor(remote: SocketConfig) {
		super();
		this.remote = remote;
		this.keepAliveBuffer = new Uint8Array(8);
		this.keepAliveView = new DataView(this.keepAliveBuffer.buffer);

		Bun.udpSocket({
			socket: {
				data: (_socket, buf) => {
					void this.onMessage(buf);
				},
				error: (_socket, error) => {
					this.emit('error', error);
				},
			},
		})
			.then((socket) => {
				this.socket = socket;
				this.keepAliveInterval = setInterval(() => this.keepAlive(), KEEP_ALIVE_INTERVAL);
				this.keepAlive();
			})
			.catch((error) => {
				this.emit('error', error);
			});
	}

	/**
	 * Called when a message is received on the UDP socket.
	 *
	 * @param buffer - The received buffer
	 */
	private onMessage(buffer: Buffer | Uint8Array): void {
		// Propagate the message
		this.emit('message', buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer));
	}

	/**
	 * Called at a regular interval to check whether we are still able to send datagrams to Discord.
	 */
	private keepAlive() {
		this.keepAliveView.setUint32(0, this.keepAliveCounter, true); // LE
		this.send(this.keepAliveBuffer);
		this.keepAliveCounter++;
		if (this.keepAliveCounter > MAX_COUNTER_VALUE) {
			this.keepAliveCounter = 0;
		}
	}

	/**
	 * Sends a buffer to Discord.
	 *
	 * @param buffer - The buffer to send
	 */
	public send(buffer: Uint8Array) {
		(this.socket as any)?.send(buffer, this.remote.port, this.remote.ip);
	}

	/**
	 * Closes the socket, the instance will not be able to be reused.
	 */
	public destroy() {
		try {
			this.socket?.close();
		} catch {}

		if (this.keepAliveInterval) clearInterval(this.keepAliveInterval);
	}

	/**
	 * Performs IP discovery to discover the local address and port to be used for the voice connection.
	 *
	 * @param ssrc - The SSRC received from Discord
	 */
	public async performIPDiscovery(ssrc: number): Promise<SocketConfig> {
		while (!this.socket) {
			await Bun.sleep(5);
		}

		return new Promise((resolve, reject) => {
			const listener = (message: Uint8Array) => {
				try {
					const view = new DataView(message.buffer, message.byteOffset, message.byteLength);
					if (view.getUint16(0, false) !== 2) return;
					const packet = parseLocalPacket(message);
					this.off('message', listener);
					resolve(packet);
				} catch {}
			};

			this.on('message', listener);
			this.once('close', () => reject(new Error('Cannot perform IP discovery - socket closed')));

			const discoveryBuffer = new Uint8Array(74);
			const discoveryView = new DataView(discoveryBuffer.buffer);

			discoveryView.setUint16(0, 1, false);
			discoveryView.setUint16(2, 70, false);
			discoveryView.setUint32(4, ssrc, false);
			this.send(discoveryBuffer);
		});
	}
}
