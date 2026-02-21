import type { Client } from '../../Client.js';
import type { GatewayDispatchPayload } from 'discord-api-types/v10';

export default (client: Client, packet: GatewayDispatchPayload) => {
  client.emit('debug', `[VOICE] received voice server: ${JSON.stringify(packet)}`);
  client.voice.onVoiceServer(packet.d);
};
