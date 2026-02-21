
import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const HANDLERS_DIR = 'C:/Users/luigi/Documents/GitHub/ovencord/packages/discord.js/src/client/websocket/handlers';

function toPascalCase(str) {
    return str.split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('');
}

async function run() {
    const files = await readdir(HANDLERS_DIR);

    for (const file of files) {
        if (!file.endsWith('.ts') || file === 'index.ts') continue;

        const filePath = join(HANDLERS_DIR, file);
        let content = await readFile(filePath, 'utf8');

        // Skip if already has precise types (optional check)
        // if (content.includes('GatewayDispatchPayload')) ...

        const eventName = file.replace('.ts', '');
        const pascalEvent = toPascalCase(eventName);
        const typeName = `Gateway${pascalEvent}Dispatch`;

        // 1. Remove old imports of Client and GatewayDispatchPayload if they exist (clean slate)
        content = content.replace(/import type { Client } from '..\/..\/Client.js';\n?/, '');
        content = content.replace(/import type { GatewayDispatchPayload } from 'discord-api-types\/v10';\n?/, '');
        // Also remove specific ones if they already exist from a previous run
        content = content.replace(/import type { Gateway\w+Dispatch } from 'discord-api-types\/v10';\n?/, '');

        // 2. Add new imports
        const imports = `import type { Client } from '../../Client.js';\nimport type { ${typeName} } from 'discord-api-types/v10';\n`;
        content = imports + content.trimStart();

        // 3. Replace the signature
        // Handles:
        // (client, { d: data })
        // (client, packet)
        // (client, { d: data }, shardId)
        // (client: Client, packet: GatewayDispatchPayload)
        // (client: Client, { d: data }: GatewayDispatchPayload)
        // (client: Client, { d: data }: GatewayDispatchPayload, shardId: number)

        // Reset types if they exist to simplify Regex
        content = content.replace(/client: Client/g, 'client');
        content = content.replace(/packet: Gateway\w*DispatchPayload/g, 'packet');
        content = content.replace(/packet: Gateway\w*Dispatch/g, 'packet');
        content = content.replace(/}: Gateway\w*DispatchPayload/g, '}');
        content = content.replace(/}: Gateway\w+Dispatch/g, '}');
        content = content.replace(/shardId: number/g, 'shardId');

        content = content.replace(
            /export default \(client, ({ d: data }|packet)(, shardId)?\) => {/,
            (match, p1, p2) => {
                const packetType = `${p1}: ${typeName}`;
                const shardPart = p2 ? `, shardId: number` : '';
                return `export default (client: Client, ${packetType}${shardPart}) => {`;
            }
        );

        await writeFile(filePath, content);
        console.log(`Fixed ${file} with type ${typeName}`);
    }
}

run().catch(console.error);
