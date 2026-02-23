export * from './audio/index';
export { getGroups, getVoiceConnection, getVoiceConnections, type JoinConfig } from './DataStore';
export * from './joinVoiceChannel';
export {
	type ConnectionData,
	type ConnectionOptions,
	DAVESession,
	Networking,
	type NetworkingClosedState,
	type NetworkingIdentifyingState,
	type NetworkingOpeningWsState,
	type NetworkingReadyState,
	type NetworkingResumingState,
	type NetworkingSelectingProtocolState,
	type NetworkingState,
	NetworkingStatusCode,
	type NetworkingUdpHandshakingState,
	type SocketConfig,
	VoiceUDPSocket,
	VoiceWebSocket,
} from './networking/index.js';
export * from './receive/index';
export * from './util/index';
export {
	VoiceConnection,
	type VoiceConnectionConnectingState,
	type VoiceConnectionDestroyedState,
	type VoiceConnectionDisconnectedBaseState,
	type VoiceConnectionDisconnectedOtherState,
	type VoiceConnectionDisconnectedState,
	type VoiceConnectionDisconnectedWebSocketState,
	VoiceConnectionDisconnectReason,
	type VoiceConnectionReadyState,
	type VoiceConnectionSignallingState,
	type VoiceConnectionState,
	VoiceConnectionStatus,
} from './VoiceConnection';

/**
 * The {@link https://github.com/ovencord/ovencord/blob/main/packages/voice#readme | @ovencord/voice} version
 * that you are currently using.
 */
// This needs to explicitly be `string` so it is not typed as a "const string" that gets injected by esbuild
export const version = '[VI]{{inject}}[/VI]' as string;
