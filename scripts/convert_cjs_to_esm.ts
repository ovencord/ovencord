
import { readdir, readFile, writeFile, unlink, stat } from 'node:fs/promises';
import { join } from 'node:path';

const TARGET_DIR = join(process.cwd(), 'packages', 'discord.js', 'src');

async function processDir(dir: string) {
    const files = await readdir(dir);
    for (const file of files) {
        const path = join(dir, file);
        const stats = await stat(path);
        
        if (stats.isDirectory()) {
            await processDir(path);
        } else if (file.endsWith('.js') || file.endsWith('.ts')) {
            await convertFile(path);
        }
    }
}

async function convertFile(path: string) {
    try {
        let content = await readFile(path, 'utf8');
        let originalContent = content;
        
        // 1. Imports
        // const { X, Y } = require('Z'); -> import { X, Y } from 'Z';
        content = content.replace(/const\s+\{\s*([^}]+)\s*\}\s*=\s*require\(['"]([^'"]+)['"]\);/g, (match, names, module) => {
            return `import { ${names} } from '${module}';`;
        });

        // const X = require('Z'); -> import X from 'Z';
        content = content.replace(/const\s+([\w\d_$]+)\s*=\s*require\(['"]([^'"]+)['"]\);/g, (match, name, module) => {
            return `import ${name} from '${module}';`;
        });

        // const X = require('Z').X; -> import { X } from 'Z';
        content = content.replace(/const\s+([\w\d_$]+)\s*=\s*require\(['"]([^'"]+)['"]\)\.\1;/g, (match, name, module) => {
            return `import { ${name} } from '${module}';`;
        });

        // 2. Exports
        // module.exports = X; -> export { X };
        content = content.replace(/module\.exports\s*=\s*([\w\d_$]+);/g, (match, name) => {
            return `export { ${name} };`;
        });

        // exports.X = ...; (Used in index.js)
        // exports.Client = require('./client/Client.js').Client;
        // -> export { Client } from './client/Client.js';
        // Note: keeping extension in import path if present.
        content = content.replace(/exports\.([\w\d_$]+)\s*=\s*require\(['"]([^'"]+)['"]\)\.\1;/g, (match, name, module) => {
            return `export { ${name} } from '${module}';`;
        });

        // __exportStar(require('...'), exports); -> export * from '...';
        content = content.replace(/__exportStar\(require\(['"]([^'"]+)['"]\), exports\);/g, (match, module) => {
            return `export * from '${module}';`;
        });
        
        // const { __exportStar } = require('tslib'); -> Remove tslib import if it's just for exportStar which we removed.
        // Or if we replace __exportStar usage, we can remove the import.
        if (content.includes("export * from '")) {
             content = content.replace(/const\s+\{\s*__exportStar\s*\}\s*=\s*require\(['"]tslib['"]\);/g, '');
        }

        // Remove 'use strict';
        content = content.replace(/'use strict';\r?\n?/g, '');

        if (content !== originalContent) {
             if (path.endsWith('.js')) {
                 const newPath = path.replace(/\.js$/, '.ts');
                 await writeFile(newPath, content);
                 await unlink(path);
                 console.log(`Converted ${path} -> ${newPath}`);
             } else {
                 // .ts file (previously renamed but content not converted)
                 await writeFile(path, content);
                 console.log(`Updated ${path}`);
             }
        }

    } catch (e) {
        console.error(`Error converting ${path}:`, e);
    }
}

async function main() {
    await processDir(TARGET_DIR);
}

main();
