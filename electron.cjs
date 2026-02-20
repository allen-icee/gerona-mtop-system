//GeronaMTOP\electron.cjs
const { app, BrowserWindow, shell } = require("electron");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

let mainWindow;
let phpServer;

const phpExe = path.join(__dirname, "php", "php.exe");

const logFilePath = path.join(app.getPath("userData"), "gerona-error.log");

function writeLog(message) {
    const time = new Date().toLocaleString();
    const formattedMessage = `[${time}] ${message}\n`;
    fs.appendFileSync(logFilePath, formattedMessage);
    console.log(formattedMessage.trim());
}

process.on("uncaughtException", (error) => {
    writeLog(`CRITICAL CRASH: ${error.message}\n${error.stack}`);
});

function createWindow() {
    writeLog("=== APPLICATION STARTED ===");
    writeLog("Running Startup Backup...");

    spawn(phpExe, ["artisan", "backup:run"], { cwd: __dirname, shell: true });

    setInterval(() => {
        writeLog("Running Scheduled Backup (4 Hours)...");
        spawn(phpExe, ["artisan", "backup:run"], {
            cwd: __dirname,
            shell: true,
        });
    }, 14400000);

    writeLog("Starting Laravel Server...");

    phpServer = spawn(
        phpExe,
        ["artisan", "serve", "--port=8000", "--host=0.0.0.0"],
        {
            cwd: __dirname,
            shell: true,
        },
    );

    phpServer.stdout.on("data", (data) => {
        writeLog(`Laravel: ${data.toString().trim()}`);
    });

    phpServer.stderr.on("data", (data) => {
        writeLog(`Laravel Error: ${data.toString().trim()}`);
    });

    phpServer.on("close", (code) => {
        writeLog(`PHP SERVER STOPPED with code ${code}`);
    });

    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        title: "Gerona MTOP System",
        icon: path.join(__dirname, "public", "images", "MunicipalityLogo.png"),
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    mainWindow.setMenu(null);

    mainWindow.webContents.on("before-input-event", (event, input) => {
        if (input.control && input.shift && input.key.toLowerCase() === "d") {
            mainWindow.webContents.toggleDevTools();
            event.preventDefault();
        }
    });

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (url.includes("/print-ids") || url.includes("/print")) {
            shell.openExternal(url);
            return { action: "deny" };
        }
        return { action: "allow" };
    });

    setTimeout(() => {
        mainWindow.loadURL("http://127.0.0.1:8000").catch((err) => {
            writeLog(`Failed to load URL: ${err.message}`);
        });
    }, 2500);

    mainWindow.on("closed", () => {
        mainWindow = null;
    });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
    writeLog("=== APPLICATION CLOSED ===\n");
    if (process.platform !== "darwin") {
        if (phpServer) {
            spawn("taskkill", ["/pid", phpServer.pid, "/f", "/t"]);
        }
        app.quit();
    }
});
