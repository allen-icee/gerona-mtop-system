const { app, BrowserWindow, shell, dialog } = require("electron");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const os = require("os");

let mainWindow;
let phpServer;

/*
|--------------------------------------------------------------------------
| PHP PATH RESOLVER
|--------------------------------------------------------------------------
*/

const phpExe = app.isPackaged
    ? path.join(process.resourcesPath, "php", "php.exe")
    : path.join(__dirname, "php", "php.exe");

/*
|--------------------------------------------------------------------------
| LOGGING
|--------------------------------------------------------------------------
*/

const logFilePath = path.join(app.getPath("userData"), "mtop-system.log");

function log(message) {
    try {
        fs.appendFileSync(
            logFilePath,
            `[${new Date().toLocaleString()}] ${message}\n`,
        );
        console.log(message);
    } catch {}
}

/*
|--------------------------------------------------------------------------
| LAN IP DETECTION
|--------------------------------------------------------------------------
*/

function getLocalIP() {
    const nets = os.networkInterfaces();

    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === "IPv4" && !net.internal) {
                return net.address;
            }
        }
    }

    return "127.0.0.1";
}

/*
|--------------------------------------------------------------------------
| DYNAMIC IP UPDATER (Updates Laravel .env before booting)
|--------------------------------------------------------------------------
*/

function updateEnvIp(ip) {
    const envPath = path.join(__dirname, ".env");

    if (fs.existsSync(envPath)) {
        let envContent = fs.readFileSync(envPath, "utf8");

        if (envContent.includes("SERVER_IP=")) {
            // Replace existing IP
            envContent = envContent.replace(/SERVER_IP=.*/g, `SERVER_IP=${ip}`);
        } else {
            // Add if it doesn't exist
            envContent += `\nSERVER_IP=${ip}`;
        }

        fs.writeFileSync(envPath, envContent);
        log(`Successfully updated .env with new IP: ${ip}`);
    } else {
        log(`Warning: .env file not found at ${envPath}`);
    }
}

/*
|--------------------------------------------------------------------------
| PHP SERVER ENGINE
|--------------------------------------------------------------------------
*/

function startPHPServer(envVars) {
    if (phpServer && !phpServer.killed) return;

    log("Starting PHP Server...");

    phpServer = spawn(
        phpExe,
        ["-S", "0.0.0.0:8000", "-t", "public", "server.php"],
        {
            cwd: __dirname,
            env: envVars,
        },
    );

    phpServer.stdout.on("data", (d) => log("PHP: " + d.toString()));
    phpServer.stderr.on("data", (d) => log("PHP ERR: " + d.toString()));

    phpServer.on("close", () => {
        log("PHP Server crashed → Restarting...");
        setTimeout(() => startPHPServer(envVars), 3000);
    });

    setInterval(() => {
        if (!phpServer || phpServer.killed) {
            log("Watchdog detected PHP crash");
            startPHPServer(envVars);
        }
    }, 15000);
}

/*
|--------------------------------------------------------------------------
| WINDOW CREATION
|--------------------------------------------------------------------------
*/

function createWindow() {
    const isPackaged = app.isPackaged;
    const localIP = getLocalIP();

    // Safely inject the new IP into Laravel's .env file FIRST
    updateEnvIp(localIP);

    const serverEnv = {
        ...process.env,
        APP_ENV: isPackaged ? "production" : "local",
        APP_DEBUG: isPackaged ? "false" : "true",
        APP_URL: `http://${localIP}:8000`,
    };

    startPHPServer(serverEnv);

    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        title: "Gerona MTOP System",

        autoHideMenuBar: true,

        icon: path.join(__dirname, "public/images/MunicipalityLogo.png"),

        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            devTools: !isPackaged,
        },
    });

    mainWindow.setMenu(null);

    /*
    |--------------------------------------------------------------------------
    | DEVTOOLS DEBUG SHORTCUT (LGU SAFE)
    |--------------------------------------------------------------------------
    */

    mainWindow.webContents.on("before-input-event", (event, input) => {
        if (input.control && input.shift && input.key.toLowerCase() === "d") {
            mainWindow.webContents.toggleDevTools();
            event.preventDefault();
        }
    });

    /*
    |--------------------------------------------------------------------------
    | EXTERNAL LINKS
    |--------------------------------------------------------------------------
    */

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (url.includes("/print")) {
            shell.openExternal(url);
            return { action: "deny" };
        }

        return { action: "allow" };
    });

    /*
    |--------------------------------------------------------------------------
    | APP LOADER
    |--------------------------------------------------------------------------
    */

    let retries = 0;

    const loadApp = () => {
        mainWindow
            .loadURL(`http://${localIP}:8000`)
            .then(() => log("Frontend Loaded"))
            .catch((err) => {
                log("Load Failed: " + err.message);

                if (retries < 10) {
                    retries++;
                    setTimeout(loadApp, 3000);
                } else {
                    dialog.showErrorBox(
                        "Server Error",
                        "MTOP System failed to start",
                    );
                }
            });
    };

    setTimeout(loadApp, 6000);

    mainWindow.on("closed", () => {
        mainWindow = null;
    });
}

/*
|--------------------------------------------------------------------------
| APP EVENTS
|--------------------------------------------------------------------------
*/
app.commandLine.appendSwitch(
    "unsafely-treat-insecure-origin-as-secure",
    `http://${getLocalIP()}:8000`,
);

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
    if (phpServer) {
        try {
            spawn("taskkill", ["/pid", phpServer.pid.toString(), "/f", "/t"]);
        } catch {}
    }

    if (process.platform !== "darwin") app.quit();
});

app.on("render-process-gone", () => {
    log("Renderer crashed → Reloading");
    mainWindow?.reload();
});
