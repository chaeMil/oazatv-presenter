const electron = require('electron');
const BrowserWindow = electron.BrowserWindow;
const path = require('path');
const url = require('url');
const NativeMethods = require('./native_methods');
const AppWindow = require('../model/app_window');

class WindowManager {
    constructor(ipcMain) {
        this.ipcMain = ipcMain;
        this.windows = {};
    }

    getWindow(window) {
        return this.windows[window];
    }

    createMainWindow(onWindowCloseCallback) {
        if (this.getWindow('mainWindow') != null) {
            this.getWindow('mainWindow').browserWindow.show();
            return;
        }

        let browserWindow = new BrowserWindow({
            width: 950,
            height: 600,
            minWidth: 800,
            minHeight: 320,
            titleBarStyle: "hidden",
            webPreferences: {
                experimentalFeatures: true
            }
        });

        this.windows['mainWindow'] = new AppWindow(this.ipcMain, browserWindow);

        this.windows['mainWindow'].browserWindow.loadURL(url.format({
            pathname: path.join(__dirname, '../ui/main.html'),
            protocol: 'file:',
            slashes: true
        }));
        this.windows['mainWindow'].browserWindow.setMenu(null);

        //this.windows['mainWindow'].browserWindow.webContents.openDevTools();

        this.windows['mainWindow'].browserWindow.on('closed', () => {
            this.windows['mainWindow'] = null;
            onWindowCloseCallback();
        });
    }

    openCanvasDesignerWindow() {
        if (this.getWindow('canvasDesignerWindow') != null) {
            this.getWindow('canvasDesignerWindow').browserWindow.show();
            return;
        }

        let browserWindow = new BrowserWindow({
            width: 1200,
            height: 700,
            minWidth: 700,
            minHeight: 500,
            titleBarStyle: "hidden",
            webPreferences: {
                experimentalFeatures: true
            }
        });

        this.windows['canvasDesignerWindow'] = new AppWindow(this.ipcMain, browserWindow);

        this.windows['canvasDesignerWindow'].browserWindow.loadURL(url.format({
            pathname: path.join(__dirname, '../ui/canvas_designer.html'),
            protocol: 'file:',
            slashes: true
        }));
        this.windows['canvasDesignerWindow'].browserWindow.setMenu(null);

        //this.windows['canvasDesignerWindow'].browserWindow.webContents.openDevTools();

        this.windows['canvasDesignerWindow'].browserWindow.on('closed', () => {
            this.windows['canvasDesignerWindow'] = null;
        });
    }

    createCanvasWindow() {
        NativeMethods.execute('electron ./app/canvas/main &', (output) => {
            console.log(output);
        });
    }
}

module.exports = WindowManager;