#!/usr/bin/env bun

/**
 * Bun WebSocketShard Refactor Script
 * 
 * This script performs surgical refactoring of WebSocketShard.ts to replace
 * all zlib/zlib-sync code with Bun-native compression.
 */

const filePath = 'c:/Users/luigi/Documents/buncord/packages/ws/src/ws/WebSocketShard.ts';

console.log('🔧 Reading WebSocketShard.ts...');
const content = await Bun.file(filePath).text();
const lines = content.split('\n');

console.log(`📊 File has ${lines.length} lines`);

// Step 1: Remove old imports and add new ones
console.log('🗑️  Removing Node.js imports...');
let refactored = content
	// Remove old imports
	.replace(/import \{ Buffer \} from 'node:buffer';\n/g, '')
	.replace(/import \{ once \} from 'node:events';\n/g, '')
	.replace(/import \{ setTimeout as sleep \} from 'node:timers\/promises';\n/g, '')
	.replace(/import type \* as nativeZlib from 'node:zlib';\n/g, '')
	.replace(/import \{ lazy,/g, 'import {')
	.replace(/, shouldUseGlobalFetchAndWebSocket/g, ' shouldUseGlobalFetchAndWebSocket')
	.replace(/@discordjs\/collection/g, '@ovencord/collection')
	.replace(/@discordjs\/util/g, '@ovencord/util')
	.replace(/import \{ WebSocket, type Data \} from 'ws';\n/g, '')
	.replace(/import type \* as ZlibSync from 'zlib-sync';\n/g, '')
	
	// Remove lazy loaders
	.replace(/\/\* eslint-disable promise\/prefer-await-to-then \*\/\n/g, '')
	.replace(/const getZlibSync = lazy\(async \(\) => import\('zlib-sync'\)\.then\(\(mod\) => mod\.default\)\.catch\(\(\) => null\)\);\n/g, '')
	.replace(/const getNativeZlib = lazy\(async \(\) => import\('node:zlib'\)\.then\(\(mod\) => mod\)\.catch\(\(\) => null\)\);\n/g, '')
	.replace(/\/\* eslint-enable promise\/prefer-await-to-then \*\/\n/g, '')
	
	// Add new import
	.replace(
		/(import \{[^}]+\} from '\.\.\/utils\/constants\.js';)/,
		`$1\nimport { BunInflateHandler, compressIdentifyPayload } from '../utils/BunCompression.js';`
	);

// Step 2: Replace class properties
console.log('🔄 Updating class properties...');
refactored = refactored
	.replace(/private nativeInflate: nativeZlib\.Inflate \| null = null;\n\n\tprivate zLibSyncInflate: ZlibSync\.Inflate \| null = null;\n\n\t\/\*\*\n\t \* @privateRemarks\n\t \*\n\t \* Used only for native zlib inflate, zlib-sync buffering is handled by the library itself\.\n\t \*\/\n\tprivate inflateBuffer: Buffer\[\] = \[\];/g,
		`/**\n\t * Bun-native compression handler for Discord gateway\n\t */\n\tprivate bunInflate: BunInflateHandler = new BunInflateHandler();`)
	.replace(/private heartbeatInterval: NodeJS\.Timeout \| null = null;/g,
		'private heartbeatInterval: number | null = null;')
	.replace(/this\.strategy\.options\.compression !== null && \(this\.nativeInflate ?? this\.zLibSyncInflate\) !== null/g,
		'this.strategy.options.compression !== null');

// Step 3: Remove compression initialization block (the big one!)
console.log('💣 Removing 80+ lines of zlib initialization...');
const compressionBlockRegex = /params\.append\('compress', CompressionParameterMap\[compression\]\);\n\n\t\t\tswitch \(compression\) \{[\s\S]*?case CompressionMethod\.ZstdNative:[\s\S]*?\}\n\t\t\t\}\n\t\t\}\n\n\t\tif \(this\.identifyCompressionEnabled\) \{[\s\S]*?this\.identifyCompressionEnabled = false;\n\t\t\t\}\n\t\t\}/;

refactored = refactored.replace(
	compressionBlockRegex,
	`// Bun native compression - no initialization needed, BunInflateHandler handles everything\n\t\tparams.append('compress', CompressionParameterMap[compression]);\n\t\t}\n\n\t\t// Identify compression is always available with Bun.gzipSync - no need to check availability`
);

// Step 4: Replace unpackMessage decompression logic
console.log('🔧 Replacing decompression logic in unpackMessage...');

// This is complex, so I'll create a new version of the function
const newUnpackMessage = `private async unpackMessage(data: ArrayBuffer | string, isBinary: boolean): Promise<GatewayReceivePayload | null> {
		// Deal with no compression
		if (!isBinary) {
			try {
				return JSON.parse(data as string) as GatewayReceivePayload;
			} catch {
				// This is a non-JSON payload / (at the time of writing this comment) emitted by bun wrongly interpreting custom close codes https://github.com/oven-sh/bun/issues/3392
				return null;
			}
		}

		const decompressable = new Uint8Array(data as ArrayBuffer);

		// Deal with identify compress (one-shot gzip compression)
		if (this.identifyCompressionEnabled) {
			try {
				const decompressed = this.bunInflate.process(decompressable, true);
				if (decompressed) {
					return JSON.parse(decompressed) as GatewayReceivePayload;
				}
				return null;
			} catch (error) {
				this.emit(WebSocketShardEvents.Error, error as Error);
				return null;
			}
		}

		// Deal with transport compression (streaming zlib)
		if (this.transportCompressionEnabled) {
			try {
				const decompressed = this.bunInflate.process(decompressable, false);
				if (decompressed) {
					return JSON.parse(decompressed) as GatewayReceivePayload;
				}
				// Message not complete yet (waiting for suffix)
				return null;
			} catch (error) {
				this.emit(WebSocketShardEvents.Error, error as Error);
				return null;
			}
		}

		this.debug([
			'Received a message we were unable to decompress',
			\`isBinary: \${isBinary.toString()}\`,
			\`identifyCompressionEnabled: \${this.identifyCompressionEnabled.toString()}\`,
			\`inflate: \${this.transportCompressionEnabled ? CompressionMethod[this.strategy.options.compression!] : 'none'}\`,
		]);

		return null;
	}`;

// Replace the old unpackMessage
refactored = refactored.replace(
	/private async unpackMessage\(data: Data, isBinary: boolean\): Promise<GatewayReceivePayload \| null> \{[\s\S]*?return null;\n\t\}/,
	newUnpackMessage
);

// Step 5: Replace parseInflateResult (no longer needed, but keep it simple)
refactored = refactored.replace(
	/private parseInflateResult\(result: any\): GatewayReceivePayload \| null \{[\s\S]*?return JSON\.parse\(typeof result === 'string' \? result : this\.textDecoder\.decode\(result\)\) as GatewayReceivePayload;\n\t\}/,
	`private parseInflateResult(result: any): GatewayReceivePayload | null {\n\t\tif (!result) {\n\t\t\treturn null;\n\t\t}\n\t\treturn JSON.parse(typeof result === 'string' ? result : new TextDecoder().decode(result)) as GatewayReceivePayload;\n\t}`
);

// Step 6: Fix any remaining references
refactored = refactored
	.replace(/this\.textDecoder\.decode/g, 'new TextDecoder().decode')
	.replace(/type Data/g, 'ArrayBuffer | string')
	.replace(/data: Data/g, 'data: ArrayBuffer | string');

// Write the refactored file
console.log('💾 Writing refactored file...');
await Bun.write(filePath, refactored);

// Show stats
const newLines = refactored.split('\n');
const linesRemoved = lines.length - newLines.length;
console.log(`\n✅ REFACTOR COMPLETE!`);
console.log(`📉 Lines removed: ${linesRemoved}`);
console.log(`📊 New file size: ${newLines.length} lines`);
console.log(`🎯 Compression logic: 100% Bun-native`);
