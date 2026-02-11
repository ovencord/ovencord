
import { ComponentType } from 'discord-api-types/v10';
import { PrimaryButtonBuilder } from './src/components/button/CustomIdButton';
import { SectionBuilder } from './src/components/v2/Section';
import * as fs from 'node:fs';

const logFile = 'debug_output.txt';
fs.writeFileSync(logFile, "Starting Test...\n");

function log(msg: string) {
    fs.appendFileSync(logFile, msg + "\n");
    console.log(msg);
}

try {
    const btn = new PrimaryButtonBuilder()
        .setCustomId("test")
        .setEmoji("🔄️")
        .setLabel("Test");

    log("Original Button toJSON: " + JSON.stringify((btn as any).toJSON(), null, 2));

    log("STEP 1: Creating SectionBuilder");
    const section = new SectionBuilder({
        components: [
            {
                content: "Placeholder text",
                type: ComponentType.TextDisplay
            }
        ]
    });

    log("STEP 1.5: Simulating resolveBuilder");
    const json = (btn as any).toJSON();
    const newBtn = new PrimaryButtonBuilder(json);
    
    log("New Button Has toJSON? " + ('toJSON' in newBtn ? "YES" : "NO"));
    if ('toJSON' in newBtn) {
         log("New Button toJSON Output: " + JSON.stringify((newBtn as any).toJSON(), null, 2));
    }

    log("STEP 2: Setting Accessory");
    section.setPrimaryButtonAccessory(newBtn); 

    log("Section Created. Accessing internal data...");
    // @ts-ignore
    const accessory = section.data.accessory;
    log("Internal Accessory Constructor: " + (accessory?.constructor.name));
    log("Internal Accessory Has toJSON? " + (accessory && 'toJSON' in accessory));

    log("STEP 3: Calling toJSON");
    const result = section.toJSON();
    log("Section JSON: " + JSON.stringify(result, null, 2));

} catch (e: any) {
    log("ERROR CAUGHT: " + e);
    if (e.stack) log("Stack: " + e.stack);
    // @ts-ignore
    if (e.cause && e.cause.issues) {
        // @ts-ignore
        log("Zod Issues: " + JSON.stringify(e.cause.issues, null, 2));
    } else {
        log("No Zod Issues found in error object");
    }
}
