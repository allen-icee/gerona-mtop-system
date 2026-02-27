// mtop-staff-client/main.js
const { app, BrowserWindow, ipcMain, shell, Menu } = require("electron");
const path = require("path");
const fs = require("fs");

// Prevent random network/promise errors from completely crashing the application
process.on("uncaughtException", (error) =>
    console.error("Uncaught Exception:", error),
);
process.on("unhandledRejection", (error) =>
    console.error("Unhandled Rejection:", error),
);

const configPath = path.join(app.getPath("userData"), "server-config.json");

if (fs.existsSync(configPath)) {
    try {
        const config = JSON.parse(fs.readFileSync(configPath));
        if (config.ip) {
            app.commandLine.appendSwitch(
                "unsafely-treat-insecure-origin-as-secure",
                `http://${config.ip}:8000`,
            );
        }
    } catch (e) {}
}

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

    const menuTemplate = [
        {
            label: "Settings",
            submenu: [
                {
                    label: "Change Server IP",
                    accelerator: "CmdOrCtrl+Shift+I",
                    click: () => {
                        if (fs.existsSync(configPath)) {
                            fs.unlinkSync(configPath);
                        }
                        mainWindow.loadFile(
                            path.join(__dirname, "settings.html"),
                        );
                    },
                },
                { type: "separator" },
                { role: "quit", label: "Exit Application" },
            ],
        },
        {
            label: "View",
            submenu: [
                { role: "reload" },
                { role: "forceReload" },
                { role: "toggleDevTools" },
                { type: "separator" },
                { role: "togglefullscreen" },
            ],
        },
    ];

    const menu = Menu.buildFromTemplate(menuTemplate);
    mainWindow.setMenu(menu);

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (url.includes("/print-ids") || url.includes("/print")) {
            shell.openExternal(url);
            return { action: "deny" };
        }
        return { action: "allow" };
    });

    const loadServer = (ip) => {
        const serverUrl = `http://${ip}:8000`;
        let loaded = false;

        mainWindow
            .loadURL(serverUrl)
            .then(() => {
                loaded = true;
            })
            .catch((err) => {
                loaded = true;
                if (!mainWindow.isDestroyed()) {
                    mainWindow
                        .loadFile(path.join(__dirname, "settings.html"))
                        .then(() => {
                            // Allow DOM to load before sending the error message
                            setTimeout(() => {
                                if (!mainWindow.isDestroyed()) {
                                    mainWindow.webContents.send(
                                        "connection-failed",
                                        ip,
                                    );
                                }
                            }, 800);
                        });
                }
            });

        setTimeout(() => {
            if (!loaded && !mainWindow.isDestroyed()) {
                mainWindow.webContents.stop();
                mainWindow
                    .loadFile(path.join(__dirname, "settings.html"))
                    .then(() => {
                        setTimeout(() => {
                            if (!mainWindow.isDestroyed()) {
                                mainWindow.webContents.send(
                                    "connection-failed",
                                    ip,
                                );
                            }
                        }, 800);
                    });
            }
        }, 8000);
    };

    if (fs.existsSync(configPath)) {
        try {
            const config = JSON.parse(fs.readFileSync(configPath));
            loadServer(config.ip);
        } catch (e) {
            mainWindow.loadFile(path.join(__dirname, "settings.html"));
        }
    } else {
        mainWindow.loadFile(path.join(__dirname, "settings.html"));
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
