const electron = require('electron');
const BrowserWindow = electron.BrowserWindow;
const path = require('path');
const url = require('url');
const NativeMethods = require('./native_methods');
const AppWindow = require('../model/app_window');
const StringUtils = require('../../shared/util/string_utils');

class WindowManager {
    constructor(ipcMain) {
        this.ipcMain = ipcMain;
        this.windows = {};
    }

    getWindow(window) {
        return this.windows[window];
    }

    openWindow(arg) {
        switch (arg.windowType) {
            case 'canvas_designer':
                this.openCanvasDesignerWindow();
                break;
            case 'canvas':
                this.createCanvasWindow();
                break;
            case 'presentation':
                this.createPresentationWindow();
                break;
        }
    }

    createMainWindow(onWindowCloseCallback) {
        let windowName = 'mainWindow';
        if (this.getWindow(windowName) != null) {
            this.getWindow(windowName).browserWindow.show();
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

        this.windows[windowName] = new AppWindow(this.ipcMain, browserWindow);

        this.windows[windowName].browserWindow.loadURL(url.format({
            pathname: path.join(__dirname, '../ui/main.html'),
            protocol: 'file:',
            slashes: true
        }));
        this.windows[windowName].browserWindow.setMenu(null);

        //this.windows[windowName].browserWindow.webContents.openDevTools();

        this.windows[windowName].browserWindow.on('closed', () => {
            this.windows[windowName] = null;
            onWindowCloseCallback();
        });
    }

    openCanvasDesignerWindow() {
        let windowName = 'canvasDesignerWindow';
        if (this.getWindow(windowName) != null) {
            this.getWindow(windowName).browserWindow.show();
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

        this.windows[windowName] = new AppWindow(this.ipcMain, browserWindow);

        this.windows[windowName].browserWindow.loadURL(url.format({
            pathname: path.join(__dirname, '../ui/canvas_designer.html'),
            protocol: 'file:',
            slashes: true
        }));
        this.windows[windowName].browserWindow.setMenu(null);

        //this.windows[windowName].browserWindow.webContents.openDevTools();

        this.windows[windowName].browserWindow.on('closed', () => {
            this.windows[windowName] = null;
        });
    }

    createCanvasWindow() {
        NativeMethods.execute('electron ./app/canvas/main &', (output) => {
            console.log(output);
        });
    }

    createPresentationWindow() {
        let id = StringUtils.makeId();
        let windowName = 'presentationWindow_' + id;

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

        this.windows[windowName] = new AppWindow(this.ipcMain, browserWindow);

        this.windows[windowName].browserWindow.loadURL(path.join("file:", __dirname, '../ui/presentation.html?windowId=' + windowName));
        this.windows[windowName].browserWindow.setMenu(null);

        //this.windows[windowName].browserWindow.webContents.openDevTools();

        this.windows[windowName].browserWindow.on('closed', () => {
            this.windows[windowName] = null;
        });
    }
}

module.exports = WindowManager;