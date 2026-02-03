
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const PACKAGES_DIR = join(process.cwd(), 'packages');

const TEMPLATE_SCRIPTS = {
    "test": "bun test",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src"
};

const STANDARD_DEV_DEPS = {
    "@types/bun": "latest",
    "eslint": "^9.39.2",
    "typescript": "^5.9.3",
    "typescript-eslint": "^8.54.0"
};

async function main() {
    const packages = await readdir(PACKAGES_DIR, { withFileTypes: true });

    for (const pkg of packages) {
        if (!pkg.isDirectory()) continue;
        
        // Skip templates or special dirs if any
        if (pkg.name === 'create-discord-bot') continue; // Skip for now as it contains templates
        if (pkg.name === 'scripts') continue; // Skip scripts package? No, standardize it too usually?
        // Actually, scripts package might be special. Let's inspect it later. Skip for safety.

        const pkgJsonPath = join(PACKAGES_DIR, pkg.name, 'package.json');
        
        try {
            const content = await readFile(pkgJsonPath, 'utf8');
            const json = JSON.parse(content);

            // 1. Rename to @ovencord/xxx
            // Logic: @discordjs/xxx -> @ovencord/xxx
            // If it is regular discord.js -> @ovencord/discord.js
            if (json.name.startsWith('@discordjs/')) {
                json.name = json.name.replace('@discordjs/', '@ovencord/');
            } else if (json.name === 'discord.js') {
                json.name = '@ovencord/discord.js';
            }

            // 2. Remove Node Engines, Add Bun
            delete json.engines?.node;
            json.engines = { ...json.engines, bun: ">=1.0.0" };

            // 3. Source Only Distribution
            json.main = "./src/index.ts";
            json.module = "./src/index.ts";
            json.types = "./src/index.ts";
            json.exports = "./src/index.ts";
            
            // Remove dist from files
            // If files exists, ensure it includes src or remove it to default to all?
            // "Source only" usually implies distributing src.
            // Let's set files to ["src"]
            json.files = ["src"];

            // 4. Scripts
            // Remove build, prepack, release via cliff-jumper (maybe?)
            // Keep basic scripts
            json.scripts = { ...TEMPLATE_SCRIPTS };

            // 5. Dependencies Cleaning
            // Remove @types/node
            if (json.devDependencies) {
                delete json.devDependencies['@types/node'];
                delete json.devDependencies['turbo'];
                delete json.devDependencies['tsup'];
                delete json.devDependencies['husky'];
                delete json.devDependencies['is-ci'];
                delete json.devDependencies['lint-staged'];
                delete json.devDependencies['rollup'];
                delete json.devDependencies['terser'];
                delete json.devDependencies['gen-esm-wrapper']; // If present
                
                // Add standard dev deps
                Object.assign(json.devDependencies, STANDARD_DEV_DEPS);
            }
            
            if (json.dependencies) {
                // Update internal deps to @ovencord/xxx
                for (const dep in json.dependencies) {
                     if (dep.startsWith('@discordjs/')) {
                         const newName = dep.replace('@discordjs/', '@ovencord/');
                         const version = json.dependencies[dep];
                         delete json.dependencies[dep];
                         json.dependencies[newName] = version;
                     }
                }
            }

            // Write back
            await writeFile(pkgJsonPath, JSON.stringify(json, null, '\t') + '\n');
            console.log(`Updated ${pkg.name}`);

        } catch (e) {
            console.error(`Skipping ${pkg.name}:`, e.message);
        }
    }
}

main();
