import fs from 'fs';
import path from 'path';

const srcDir = 'packages/discord.js/src';

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('public client: any;')) {
    // Non rimuoviamo da Base.ts e BaseManager.ts
    if (filePath.endsWith('Base.ts') || filePath.endsWith('BaseManager.ts')) return;
    
    console.log(`Cleaning ${filePath}`);
    const lines = content.split('\n');
    const filteredLines = lines.filter(line => !line.trim().startsWith('public client: any;'));
    fs.writeFileSync(filePath, filteredLines.join('\n'));
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.ts')) {
      processFile(fullPath);
    }
  }
}

walk(srcDir);
