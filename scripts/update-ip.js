//GeronaMTOP\scripts\update-ip.js
import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, "..");

function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === "IPv4" && !iface.internal) {
                return iface.address;
            }
        }
    }
    return "127.0.0.1";
}

const ip = getLocalIP();
console.log(`\n🚀  AUTO-CONFIGURING FOR IP: ${ip}`);

const envPath = path.join(rootDir, ".env");
if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, "utf8");

    envContent = envContent.replace(
        /^APP_URL=.*$/m,
        `APP_URL=http://${ip}:8000`,
    );
    fs.writeFileSync(envPath, envContent);
    console.log(`✅  Updated .env APP_URL`);
}

const vitePath = path.join(rootDir, "vite.config.ts");
if (fs.existsSync(vitePath)) {
    let viteContent = fs.readFileSync(vitePath, "utf8");

    const regex = /hmr:\s*\{\s*host:\s*["'].*?["']\s*,/s;
    if (regex.test(viteContent)) {
        viteContent = viteContent.replace(
            regex,
            `hmr: {\n            host: "${ip}",`,
        );
        fs.writeFileSync(vitePath, viteContent);
        console.log(`✅  Updated vite.config.ts HMR Host`);
    } else {
        console.log(
            `⚠️  Could not find HMR host in vite.config.ts. Check formatting.`,
        );
    }
}

const batPath = path.join(rootDir, "Start_MTOP_System.bat");
if (fs.existsSync(batPath)) {
    let batContent = fs.readFileSync(batPath, "utf8");

    batContent = batContent.replace(
        /start http:\/\/[\d\.]+:8100/,
        `start http://${ip}:8000`,
    );

    batContent = batContent.replace(
        /echo OTHER STAFF should use:\s+http:\/\/[\d\.]+:8100/,
        `echo OTHER STAFF should use:      http://${ip}:8000`,
    );

    fs.writeFileSync(batPath, batContent);
    console.log(`✅  Updated Launcher Shortcuts`);
}

console.log(`✨  Configuration Complete! Starting System...\n`);
