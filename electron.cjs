const { app, BrowserWindow, shell } = require("electron"); // ✅ ADDED 'shell'
const { spawn } = require("child_process");
const path = require("path");

let mainWindow;
let phpServer;

function createWindow() {
    console.log("Running Startup Backup...");
    spawn("php", ["artisan", "backup:run"], { cwd: __dirname, shell: true });

    setInterval(() => {
        console.log("Running Scheduled Backup (4 Hours)...");
        spawn("php", ["artisan", "backup:run"], {
            cwd: __dirname,
            shell: true,
        });
    }, 14400000);

    console.log("Starting Laravel Server...");

    phpServer = spawn(
        "php",
        ["artisan", "serve", "--port=8000", "--host=0.0.0.0"],
        {
            cwd: __dirname,
            shell: true,
        },
    );

    phpServer.stdout.on("data", (data) => {
        console.log(`Laravel: ${data}`);
    });

    phpServer.stderr.on("data", (data) => {
        console.error(`Laravel Error: ${data}`);
    });

    // 2. Create the Window
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

    // ✅ ADD THIS BLOCK: Intercept print routes and open in Google Chrome / Edge
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        // Check if the URL contains your print route
        if (url.includes("/print-ids") || url.includes("/print")) {
            shell.openExternal(url); // Opens in OS default browser
            return { action: "deny" }; // Stops Electron from opening a popup
        }
        return { action: "allow" };
    });

    // 3. Load the URL
    setTimeout(() => {
        mainWindow.loadURL("http://127.0.0.1:8000");
    }, 2500);

    mainWindow.on("closed", () => {
        mainWindow = null;
    });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        if (phpServer) {
            spawn("taskkill", ["/pid", phpServer.pid, "/f", "/t"]);
        }
        app.quit();
    }
});
