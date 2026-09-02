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

function updateEnvVar(content, key, value) {
    const regex = new RegExp(`^${key}=.*$`, "m");
    if (regex.test(content)) {
        return content.replace(regex, `${key}=${value}`);
    } else {
        const separator = content.endsWith('\n') || content === '' ? '' : '\n';
        return `${content}${separator}${key}=${value}\n`;
    }
}

const envPath = path.join(rootDir, ".env");
if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, "utf8");

    envContent = updateEnvVar(envContent, "APP_URL", `http://${ip}:8000`);
    envContent = updateEnvVar(envContent, "SERVER_IP", ip);
    envContent = updateEnvVar(envContent, "VITE_HMR_HOST", ip);

    fs.writeFileSync(envPath, envContent);
    console.log(`✅  Updated .env APP_URL, SERVER_IP, and VITE_HMR_HOST to ${ip}`);
}

// Remove stale public/hot file so Vite regenerates it with the current IP
const hotPath = path.join(rootDir, "public", "hot");
if (fs.existsSync(hotPath)) {
    try {
        fs.unlinkSync(hotPath);
        console.log(`✅  Cleared old public/hot file`);
    } catch (e) {
        console.log(`⚠️  Could not remove public/hot: ${e.message}`);
    }
}

const batPath = path.join(rootDir, "Start_MTOP_System.bat");
if (fs.existsSync(batPath)) {
    let batContent = fs.readFileSync(batPath, "utf8");

    batContent = batContent.replace(
        /start http:\/\/[\d\.]+:8100/g,
        `start http://${ip}:8000`,
    );

    batContent = batContent.replace(
        /echo OTHER STAFF should use:\s+http:\/\/[\d\.]+:8100/g,
        `echo OTHER STAFF should use:      http://${ip}:8000`,
    );

    fs.writeFileSync(batPath, batContent);
    console.log(`✅  Updated Launcher Shortcuts`);
}

console.log(`✨  Configuration Complete! Starting System...\n`);
