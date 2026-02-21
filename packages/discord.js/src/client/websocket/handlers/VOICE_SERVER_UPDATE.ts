import type { Client } from '../../Client.js';
import type { GatewayVoiceServerUpdateDispatch } from 'discord-api-types/v10';
export default (client: Client, packet: GatewayVoiceServerUpdateDispatch) => {
  client.emit('debug', `[VOICE] received voice server: ${JSON.stringify(packet)}`);
  client.voice.onVoiceServer(packet.d);
};
