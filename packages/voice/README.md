# @𝗼𝘃𝗲𝗻𝗰𝗼𝗿𝗱/𝘃𝗼𝗶𝗰𝗲

<div align="left">
	<p>
		<a href="https://discord.gg/ovencord"><img src="https://img.shields.io/badge/join_us-on_discord-5865F2?logo=discord&logoColor=white" alt="Discord server" /></a>
		<a href="https://www.npmjs.com/package/@ovencord/voice"><img src="https://img.shields.io/npm/v/@ovencord/voice.svg?maxAge=3600" alt="npm version" /></a>
		<img src="https://saizu.dev/badge/@ovencord/voice?type=install" alt="install size">
		<a href="https://github.com/ovencord/ovencord/actions"><img src="https://github.com/ovencord/ovencord/actions/workflows/ci.yml/badge.svg" alt="CI status" /></a>
	</p>
</div>
<div align="center">
	<p>
		<a href="https://ovencord.dev"><img src="https://github.com/ovencord.png" width="250" alt="ovencord" /></a>
	</p>
</div>

## About

`@ovencord/voice` is a TypeScript implementation of the Discord Voice API for Node.js.

**Features:**

- Send and receive\* audio in Discord voice-based channels
- A strong focus on reliability and predictable behavior
- Horizontal scalability and libraries other than [discord.js](https://discord.js.org/) are supported with custom adapters
- A robust audio processing system that can handle a wide range of audio sources

\*_Audio receive is not documented by Discord so stable support is not guaranteed_

## 📦 Installation

**Bun 1.0.+ is required, but we recommend always using the most up-to-date version**

```sh
bun add @ovencord/voice
```

## Dependencies

This library has several optional dependencies to support a variety
of different platforms. Install one dependency from each of the
categories shown below. The dependencies are listed in order of
preference for performance. If you can't install one of the options,
try installing another.

**Encryption Libraries (npm install):**

> [!NOTE]
> You only need to install one of these libraries if your system does not support `aes-256-gcm` (verify by running `require('node:crypto').getCiphers().includes('aes-256-gcm')`).

- `sodium-native`: ^3.3.0
- `sodium`: ^3.0.2
- `@stablelib/xchacha20poly1305`: ^2.0.0
- `@noble/ciphers`: ^1.0.0
- `libsodium-wrappers`: ^0.7.9

**DAVE Protocol Libraries (e2ee)**

> [!NOTE]
> At this time, `@snazzah/davey` is the only supported DAVE protocol library in this package, and comes pre-installed. In the future, we may support other libraries once they are created.

- `@snazzah/davey`: ^0.1.6

**Opus Libraries (npm install):**

- `@ovencord/opus`: ^0.4.0
- `opusscript`: ^0.0.7

**FFmpeg:**

- [`FFmpeg`](https://ffmpeg.org/) (installed and added to environment)
- `ffmpeg-static`: ^4.2.7 (npm install)

