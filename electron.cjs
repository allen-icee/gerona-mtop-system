const { app, BrowserWindow, shell, dialog } = require("electron");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const os = require("os");

let mainWindow;
let phpServer;

const phpExe = path.join(__dirname, "php", "php.exe");

const logFilePath = path.join(app.getPath("userData"), "mtop-system.log");

function writeLog(message) {
    try {
        const time = new Date().toLocaleString();
        fs.appendFileSync(logFilePath, `[${time}] ${message}\n`);
        console.log(message);
    } catch {}
}

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

function startPHPServer(envVars) {
    if (phpServer && !phpServer.killed) {
        return;
    }

    phpServer = spawn(phpExe, ["-S", "0.0.0.0:8000", "server.php"], {
        cwd: __dirname,
        env: envVars,
    });

    phpServer.stdout.on("data", (d) => writeLog(d.toString()));
    phpServer.stderr.on("data", (d) => writeLog("PHP ERR: " + d));

    phpServer.on("close", () => {
        writeLog("PHP Server crashed. Restarting...");
        setTimeout(() => startPHPServer(envVars), 3000);
    });

    setInterval(() => {
        if (!phpServer || phpServer.killed) {
            writeLog("Watchdog restarting PHP...");
            startPHPServer(envVars);
        }
    }, 15000);
}

function createWindow() {
    const isPackaged = app.isPackaged;
    const localIP = getLocalIP();

    const serverEnv = {
        ...process.env,
        APP_ENV: isPackaged ? "production" : "local",
        APP_DEBUG: isPackaged ? "false" : "true",
        APP_URL: isPackaged
            ? `http://${localIP}:8000`
            : "http://127.0.0.1:8000",
    };

    startPHPServer(serverEnv);

    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        title: "Gerona MTOP System",
        autoHideMenuBar: true,
        icon: path.join(__dirname, "public/images/MunicipalityLogo.png"),
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    mainWindow.setMenu(null);

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (url.includes("/print")) {
            shell.openExternal(url);
            return { action: "deny" };
        }

        return { action: "allow" };
    });

    let retries = 0;

    const loadApp = () => {
        mainWindow.loadURL("http://127.0.0.1:8000").catch(() => {
            if (retries < 6) {
                retries++;
                setTimeout(loadApp, 2000);
            } else {
                dialog.showErrorBox(
                    "Server Error",
                    "MTOP System failed to start.",
                );
            }
        });
    };

    setTimeout(loadApp, 3000);

    mainWindow.on("closed", () => {
        mainWindow = null;
    });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
    if (phpServer) {
        try {
            spawn("taskkill", ["/pid", phpServer.pid.toString(), "/f", "/t"]);
        } catch {}
    }

    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("render-process-gone", () => {
    writeLog("Renderer crashed → Reloading");
    mainWindow?.reload();
});
