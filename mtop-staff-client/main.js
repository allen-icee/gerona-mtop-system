const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

// This saves the IP in a safe hidden folder on the staff's Windows PC
const configPath = path.join(app.getPath("userData"), "server-config.json");

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        autoHideMenuBar: true, // ✅ Hides the top menu bar
        icon: path.join(__dirname, "MunicipalityLogo.png"), // ✅ Custom Logo (Make sure icon.png is in this folder!)
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    // ✅ Completely removes the File/Edit/View menu
    mainWindow.setMenu(null);

    // Function to load the MTOP server
    const loadServer = (ip) => {
        // We use port 8100 as configured in your update-ip.js
        const serverUrl = `http://${ip}:8100`;

        mainWindow.loadURL(serverUrl).catch((err) => {
            console.log("Failed to connect, showing settings...");
            mainWindow.loadFile("settings.html");
        });
    };

    // 1. Check if we already saved an IP before
    if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath));
        loadServer(config.ip);
    } else {
        // 2. If no IP is saved, show the settings page
        mainWindow.loadFile("settings.html");
    }

    // 3. Listen for the user clicking "Save" on the settings page
    ipcMain.on("save-ip", (event, ip) => {
        fs.writeFileSync(configPath, JSON.stringify({ ip }));
        loadServer(ip);
    });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});
