import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

const PROJECT_ROOT = 'C:/Users/luigi/Documents/GitHub/ovencord';
const ERROR_LOG = 'c:/Users/luigi/Documents/GitHub/brus-dev/final_tsc_report_djs_v8.txt';

async function run() {
    console.log('Reading error log...');
    const errorLog = await readFile(ERROR_LOG, 'utf8');
    const lines = errorLog.split('\n');

    const fileErrors = {};
    for (const line of lines) {
        // Match both relative and absolute paths in the error log
        const match = line.match(/(.+\.ts)\((\d+),(\d+)\): error TS(7006|7031|7019|7010|7018|7034|7005): (.+)/);
        if (match) {
            let filePath = match[1];
            if (filePath.startsWith('../ovencord/')) {
                filePath = join(PROJECT_ROOT, filePath.replace('../ovencord/', ''));
            } else if (filePath.startsWith('../')) {
                filePath = join(PROJECT_ROOT, '..', filePath.replace('../', ''));
            } else if (!filePath.includes(':')) {
                 filePath = join(PROJECT_ROOT, filePath);
            }
            
            const lineNum = parseInt(match[2]);
            const charNum = parseInt(match[3]);
            const errorMsg = match[5];

            if (!fileErrors[filePath]) fileErrors[filePath] = [];
            fileErrors[filePath].push({ line: lineNum, char: charNum, msg: errorMsg });
        }
    }

    console.log(`Found errors in ${Object.keys(fileErrors).length} files.`);

    for (const [filePath, errors] of Object.entries(fileErrors)) {
        if (!existsSync(filePath)) {
            console.warn(`File not found: ${filePath}`);
            continue;
        }

        console.log(`Processing ${filePath} (${errors.length} errors)`);
        
        // Sort errors in reverse order (bottom to top, right to left)
        errors.sort((a, b) => b.line - a.line || b.char - a.char);

        let content = await readFile(filePath, 'utf8');
        const contentLines = content.split('\n');

        for (const error of errors) {
            const lineIdx = error.line - 1;
            const originalLine = contentLines[lineIdx];
            if (lineIdx < 0 || lineIdx >= contentLines.length) continue;

            const paramMatch = error.msg.match(/Parameter '(\w+)'/);
            const bindingMatch = error.msg.match(/Binding element '(\w+)'/);
            const restMatch = error.msg.match(/Rest parameter '(\w+)'/);
            
            const paramName = (paramMatch?.[1] || bindingMatch?.[1] || restMatch?.[1]);
            
            if (paramName) {
                const startIdx = error.char - 1;
                const part = originalLine.substring(startIdx);
                
                if (part.startsWith(paramName)) {
                     const afterParam = originalLine.substring(startIdx + paramName.length);
                     const trimmedAfter = afterParam.trimStart();
                     
                     // Check if it already has a type or is followed by something that implies one
                     if (!trimmedAfter.startsWith(':') && !trimmedAfter.startsWith('?') && !trimmedAfter.startsWith('=') && !trimmedAfter.startsWith('|')) {
                        let suffix = error.msg.includes('Rest parameter') ? ': any[]' : ': any';
                        
                        // Handle arrow function bare parameter: x => ... -> (x: any) => ...
                        if (trimmedAfter.startsWith('=>')) {
                             const beforeParam = originalLine.substring(0, startIdx);
                             // If it's not already in parens (simple check: look for ( before it)
                             if (!beforeParam.trim().endsWith('(')) {
                                contentLines[lineIdx] = beforeParam + '(' + paramName + suffix + ')' + afterParam;
                             } else {
                                contentLines[lineIdx] = beforeParam + paramName + suffix + afterParam;
                             }
                        } else {
                            contentLines[lineIdx] = originalLine.substring(0, startIdx + paramName.length) + suffix + originalLine.substring(startIdx + paramName.length);
                        }
                     }
                }
            } else if (error.msg.includes('implicitly has an \'any\' return type')) {
                // Return type error TS7010. Add : any before the opening brace or after the closing paren.
                // Simple fix: find ) and add : any
                const lastParen = originalLine.lastIndexOf(')');
                if (lastParen !== -1 && !originalLine.includes('):')) {
                     contentLines[lineIdx] = originalLine.substring(0, lastParen + 1) + ': any' + originalLine.substring(lastParen + 1);
                }
            }
        }
        
        await writeFile(filePath, contentLines.join('\n'));
    }
    console.log('Finished fixing errors.');
}

run().catch(console.error);
