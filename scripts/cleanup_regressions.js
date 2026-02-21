import { readFile, writeFile, readdir, stat } from 'fs/promises';
import { join } from 'path';

const PROJECT_ROOT = 'C:/Users/luigi/Documents/GitHub/ovencord/packages/discord.js/src';

async function walk(dir) {
    let results = [];
    const list = await readdir(dir);
    for (let file of list) {
        file = join(dir, file);
        const s = await stat(file);
        if (s.isDirectory()) {
            results = results.concat(await walk(file));
        } else if (file.endsWith('.ts')) {
            results.push(file);
        }
    }
    return results;
}

async function run() {
    const files = await walk(PROJECT_ROOT);
    console.log(`Checking ${files.length} files...`);

    for (const filePath of files) {
        let content = await readFile(filePath, 'utf8');
        let changed = false;

        // 1. Fix double (or more) : any: any
        if (content.includes(': any: any')) {
            content = content.replace(/: any: any/g, ': any');
            changed = true;
        }

        // 2. Fix destructuring patterns in parameters/assignments
        // This regex looks for { ... } containing : any and cleans it up.
        // It's a bit aggressive but most of the : any inside { } are from our bad script.
        const pattern = /\{[^{}]*\}/g;
        let match;
        let newContent = content;
        while ((match = pattern.exec(content)) !== null) {
            const inner = match[0];
            if (inner.includes(': any')) {
                const cleaned = inner.replace(/(\w+): any/g, '$1');
                // If it was changed, we might need to add : any after it if it follows a parameter position
                // But safer to just clean it up first.
                newContent = newContent.replace(inner, cleaned + ': any');
                changed = true;
            }
        }
        
        if (changed) {
            console.log(`Cleaned up ${filePath}`);
            await writeFile(filePath, newContent);
        }
    }
}

run().catch(console.error);
