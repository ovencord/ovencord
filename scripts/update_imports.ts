
import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { join } from 'node:path';

const PACKAGES_DIR = join(process.cwd(), 'packages');

// List of internal packages that were renamed
const INTERNAL_PACKAGES = new Set([
    'actions', 'api-extractor', 'api-extractor-model', 'api-extractor-utils',
    'brokers', 'builders', 'collection', 'core', 'discord.js', 'docgen',
    'formatters', 'next', 'proxy', 'proxy-container', 'rest', 'structures',
    'ui', 'util', 'voice', 'ws'
]);

async function processDir(dir: string) {
    const files = await readdir(dir);
    for (const file of files) {
        const path = join(dir, file);
        const stats = await stat(path);
        
        if (stats.isDirectory()) {
            if (file === 'node_modules' || file === '.git' || file === 'dist') continue;
            await processDir(path);
        } else if (file.endsWith('.ts') || file.endsWith('.js') || file.endsWith('.mjs') || file.endsWith('.cjs')) {
            await processFile(path);
        }
    }
}

async function processFile(path: string) {
    try {
        let content = await readFile(path, 'utf8');
        let modified = false;

        // Replace @discordjs/ with @ovencord/ for internal packages
        // Regex look for strings containing @discordjs/pkgName
        
        // We iterate internal packages to be safe? Or just replace @discordjs/ with @ovencord/
        // provided it is NOT @discordjs/opus (which is external) or others.
        // Safer to check specific list.

        for (const pkg of INTERNAL_PACKAGES) {
            // Check for @discordjs/pkg
            const regex = new RegExp(`@discordjs/${pkg}`, 'g');
            if (regex.test(content)) {
                content = content.replace(regex, `@ovencord/${pkg}`);
                modified = true;
            }
        }
        
        // Special case: `discord.js` package itself. 
        // Usage: import ... from 'discord.js'; -> import ... from '@ovencord/discord.js';
        // But only if we decided to rename it to @ovencord/discord.js (which we did).
        // Check for 'discord.js' string in imports.
        // Regex: from ['"]discord.js['"] or require(['"]discord.js['"])
        const djsRegex = /from ['"]discord\.js['"]/g;
        if (djsRegex.test(content)) {
            content = content.replace(djsRegex, "from '@ovencord/discord.js'");
            modified = true;
        }
        const djsRequireRegex = /require\(['"]discord\.js['"]\)/g;
        if (djsRequireRegex.test(content)) {
            content = content.replace(djsRequireRegex, "require('@ovencord/discord.js')");
            modified = true;
        }

        if (modified) {
            await writeFile(path, content);
            console.log(`Updated imports in ${path}`);
        }
    } catch (e) {
        console.error(`Error processing ${path}:`, e);
    }
}

async function main() {
    await processDir(PACKAGES_DIR);
}

main();
