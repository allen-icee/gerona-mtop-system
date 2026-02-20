const { app, BrowserWindow, shell } = require("electron");
const { spawn } = require("child_process");
const path = require("path");

let mainWindow;
let phpServer;

// ✅ Define path to portable PHP
const phpExe = path.join(__dirname, "php", "php.exe");

function createWindow() {
    console.log("Running Startup Backup...");
    // ✅ Use portable PHP
    spawn(phpExe, ["artisan", "backup:run"], { cwd: __dirname, shell: true });

    setInterval(() => {
        console.log("Running Scheduled Backup (4 Hours)...");
        // ✅ Use portable PHP
        spawn(phpExe, ["artisan", "backup:run"], {
            cwd: __dirname,
            shell: true,
        });
    }, 14400000);

    console.log("Starting Laravel Server...");

    // ✅ Use portable PHP for the main server
    phpServer = spawn(
        phpExe,
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

    // ✅ Intercept print routes and open in Google Chrome / Edge
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (url.includes("/print-ids") || url.includes("/print")) {
            shell.openExternal(url);
            return { action: "deny" };
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
