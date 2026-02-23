import { SILENCE_FRAME } from '../audio/AudioPlayer';

/**
 * The different behaviors an audio receive stream can have for deciding when to end.
 */
export enum EndBehaviorType {
	/**
	 * The stream will only end when manually destroyed.
	 */
	Manual,

	/**
	 * The stream will end after a given time period of silence/no audio packets.
	 */
	AfterSilence,

	/**
	 * The stream will end after a given time period of no audio packets.
	 */
	AfterInactivity,
}

export type EndBehavior =
	| {
			behavior: EndBehaviorType.AfterInactivity | EndBehaviorType.AfterSilence;
			duration: number;
	  }
	| {
			behavior: EndBehaviorType.Manual;
	  };

export interface AudioReceiveStreamOptions extends UnderlyingSource<Uint8Array | null> {
	end: EndBehavior;
}

export function createDefaultAudioReceiveStreamOptions(): AudioReceiveStreamOptions {
	return {
		end: {
			behavior: EndBehaviorType.Manual,
		},
	};
}

/**
 * A readable stream of Opus packets received from a specific entity
 * in a Discord voice connection.
 */
export class AudioReceiveStream {
	/**
	 * The underlying Web Stream
	 */
	public readonly stream: ReadableStream<Uint8Array | null>;

	/**
	 * The end behavior of the receive stream.
	 */
	public readonly end: EndBehavior;

	private endTimeout?: NodeJS.Timeout;
	private controller!: ReadableStreamDefaultController<Uint8Array | null>;
	private isClosed = false;

	public onClose?: () => void;

	public get destroyed() {
		return this.isClosed;
	}

	public constructor(options: AudioReceiveStreamOptions) {
		const { end, ...rest } = options;

		this.end = end;

		this.stream = new ReadableStream<Uint8Array | null>({
			...rest,
			start: (controller) => {
				this.controller = controller as any;
				if (rest.start) rest.start(controller);
			},
			cancel: (reason) => {
				this.isClosed = true;
				if (rest.cancel) rest.cancel(reason);
				if (this.onClose) this.onClose();
			}
		});
	}

	public push(buffer: Uint8Array | null) {
		if (this.isClosed) return;

		if (
			buffer &&
			(this.end.behavior === EndBehaviorType.AfterInactivity ||
				(this.end.behavior === EndBehaviorType.AfterSilence &&
					(!(buffer.length === SILENCE_FRAME.length && buffer[0] === SILENCE_FRAME[0] && buffer[1] === SILENCE_FRAME[1] && buffer[2] === SILENCE_FRAME[2]) || this.endTimeout === undefined)))
		) {
			this.renewEndTimeout(this.end);
		}

		if (buffer === null) {
			this.destroy();
		} else {
			try {
				this.controller.enqueue(buffer);
			} catch {
				this.isClosed = true;
			}
		}
	}

	public destroy(error?: Error) {
		if (this.isClosed) return;
		this.isClosed = true;

		try {
			if (error) {
				this.controller.error(error);
			} else {
				this.controller.close();
			}
		} catch {}

		if (this.onClose) this.onClose();
	}

	private renewEndTimeout(end: EndBehavior & { duration: number }) {
		if (this.endTimeout) {
			clearTimeout(this.endTimeout);
		}

		this.endTimeout = setTimeout(() => this.push(null), end.duration);
	}
}
