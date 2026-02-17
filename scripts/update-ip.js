import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";

// Setup paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, "..");

// 1. Detect the correct Local Network IP (IPv4)
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            // Skip internal (127.0.0.1) and non-IPv4 addresses
            if (iface.family === "IPv4" && !iface.internal) {
                return iface.address;
            }
        }
    }
    return "127.0.0.1"; // Fallback
}

const ip = getLocalIP();
console.log(`\n🚀  AUTO-CONFIGURING FOR IP: ${ip}`);

// 2. Update .env (APP_URL)
const envPath = path.join(rootDir, ".env");
if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, "utf8");
    // Replace APP_URL=... with new IP
    envContent = envContent.replace(
        /^APP_URL=.*$/m,
        `APP_URL=http://${ip}:8100`,
    );
    fs.writeFileSync(envPath, envContent);
    console.log(`✅  Updated .env APP_URL`);
}

// 3. Update vite.config.ts (HMR Host)
const vitePath = path.join(rootDir, "vite.config.ts");
if (fs.existsSync(vitePath)) {
    let viteContent = fs.readFileSync(vitePath, "utf8");
    // Smart Regex to find the hmr host line
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

// 4. Update Start_MTOP_System.bat (Browser Launch URL)
const batPath = path.join(rootDir, "Start_MTOP_System.bat");
if (fs.existsSync(batPath)) {
    let batContent = fs.readFileSync(batPath, "utf8");

    // Update the "start http://..." line
    batContent = batContent.replace(
        /start http:\/\/[\d\.]+:8100/,
        `start http://${ip}:8100`,
    );

    // Update the "OTHER STAFF" echo line (Optional visual)
    batContent = batContent.replace(
        /echo OTHER STAFF should use:\s+http:\/\/[\d\.]+:8100/,
        `echo OTHER STAFF should use:      http://${ip}:8100`,
    );

    fs.writeFileSync(batPath, batContent);
    console.log(`✅  Updated Launcher Shortcuts`);
}

console.log(`✨  Configuration Complete! Starting System...\n`);
