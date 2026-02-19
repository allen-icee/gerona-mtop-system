const { app, BrowserWindow } = require("electron");
const { spawn } = require("child_process");
const path = require("path");

let mainWindow;
let phpServer;

function createWindow() {
    // 1. Start Laravel Server
    // We use the system PHP directly
    console.log("Starting Laravel Server...");

    // We assume 'php' is in the system PATH
    phpServer = spawn(
        "php",
        ["artisan", "serve", "--port=8000", "--host=127.0.0.1"],
        {
            cwd: __dirname, // Current folder
            shell: true,
        },
    );

    phpServer.stdout.on("data", (data) => {
        // Only print if you want to debug
        // console.log(`Laravel: ${data}`);
    });

    phpServer.stderr.on("data", (data) => {
        console.error(`Laravel Error: ${data}`);
    });

    // 2. Create the Window
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        title: "Gerona MTOP System",
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    // 3. Load the URL
    // Wait 2.5 seconds for Laravel to boot up
    setTimeout(() => {
        mainWindow.loadURL("http://127.0.0.1:8000");
    }, 2500);

    mainWindow.on("closed", () => {
        mainWindow = null;
    });
}

// App Lifecycle
app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
    // Force kill PHP when window closes
    if (process.platform !== "darwin") {
        if (phpServer) {
            spawn("taskkill", ["/pid", phpServer.pid, "/f", "/t"]);
        }
        app.quit();
    }
});
