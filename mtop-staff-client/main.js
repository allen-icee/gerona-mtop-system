const { app, BrowserWindow, ipcMain, shell } = require("electron"); // ✅ ADDED 'shell'
const path = require("path");
const fs = require("fs");

const configPath = path.join(app.getPath("userData"), "server-config.json");

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        autoHideMenuBar: true,
        icon: path.join(__dirname, "MunicipalityLogo.png"),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    mainWindow.setMenu(null);

    // ✅ ADD THIS BLOCK: Intercept print routes and open in Google Chrome / Edge
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (url.includes("/print-ids") || url.includes("/print")) {
            shell.openExternal(url);
            return { action: "deny" };
        }
        return { action: "allow" };
    });

    const loadServer = (ip) => {
        const serverUrl = `http://${ip}:8000`;

        mainWindow.loadURL(serverUrl).catch((err) => {
            console.log("Failed to connect, showing settings...");
            mainWindow.loadFile("settings.html");
        });
    };

    if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath));
        loadServer(config.ip);
    } else {
        mainWindow.loadFile("settings.html");
    }

    ipcMain.on("save-ip", (event, ip) => {
        fs.writeFileSync(configPath, JSON.stringify({ ip }));
        loadServer(ip);
    });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});
