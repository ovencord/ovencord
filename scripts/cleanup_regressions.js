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

        // 2. Fix invalid : any after default assignments
        // pattern: = {}: any, = []: any, = null: any, = undefined: any
        const defaultReg = /(= \s*(\{\}|\[\]|null|undefined|false|true))\s*: any/g;
        if (defaultReg.test(content)) {
            content = content.replace(defaultReg, '$1');
            changed = true;
        }

        // 3. Fix invalid : any after closing braces in expression positions
        // e.g. }: any);  }: any,  }: any.  }: any]
        const braceReg = /\}\s*: any(\s*[;,\)\]\.\}])/g;
        if (braceReg.test(content)) {
            content = content.replace(braceReg, '}$1');
            changed = true;
        }

        // 4. Fix specific destructuring mess in parameters
        // Pattern: ({ a, b }: any: any) -> ({ a, b }: any)
        // Already handled by step 1, but let's be sure.

        // 5. Fix : any: any in class properties or method signatures
        // Already handled.

        if (changed) {
            console.log(`Cleaned up ${filePath}`);
            await writeFile(filePath, content);
        }
    }
}

run().catch(console.error);
