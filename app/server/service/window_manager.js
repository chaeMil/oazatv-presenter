const electron = require('electron');
const {app, dialog} = electron;
const BrowserWindow = electron.BrowserWindow;
const path = require('path');
const url = require('url');
const os = require('os');
const NativeMethods = require('./native_methods');
const AppWindow = require('../model/app_window');
const StringUtils = require('../../shared/util/string_utils');
const windowStateKeeper = require('electron-window-state');
const {is} = require('electron-util');

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

    windowOperation(action, data) {
        switch (action) {
            case "close":
                this._closeWindow(data);
                break;
            case "destroy":
                this._destroyWindow(data);
                break;
            //TODO add more
        }
    }

    _closeWindow(data) {
        this.windows[data.windowId].browserWindow.close();
        this.windows[data.windowId] = null;
    }

    _destroyWindow(data) {
        this.windows[data.windowId].browserWindow.destroy();
        this.windows[data.windowId] = null;
    }

    createMainWindow(onWindowCloseCallback) {
        let windowName = 'mainWindow';
        if (this.getWindow(windowName) != null) {
            this.getWindow(windowName).browserWindow.show();
            return;
        }

        let windowState = windowStateKeeper({
            defaultWidth: 950,
            defaultHeight: 600,
            file: 'mainWindow.state'
        });
        let browserWindow = new BrowserWindow({
            x: windowState.x,
            y: windowState.y,
            width: windowState.width,
            height: windowState.height,
            titleBarStyle: "hidden",
            webPreferences: {
                experimentalFeatures: true
            },
            show: false
        });
        windowState.manage(browserWindow);

        this.windows[windowName] = new AppWindow(this.ipcMain, browserWindow);
        this.windows[windowName].browserWindow.loadURL(url.format({
            pathname: path.join(__dirname, '../ui/main.html'),
            protocol: 'file:',
            slashes: true,
        }));
        this.windows[windowName].browserWindow.webContents.once('did-finish-load', () => {
            this.windows[windowName].browserWindow.show();
        });
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

        let windowState = windowStateKeeper({
            defaultWidth: 1200,
            defaultHeight: 700,
            file: 'canvasDesignerWindow.state'
        });
        let browserWindow = new BrowserWindow({
            x: windowState.x,
            y: windowState.y,
            width: windowState.width,
            height: windowState.height,
            minWidth: 700,
            minHeight: 500,
            titleBarStyle: "hidden",
            webPreferences: {
                experimentalFeatures: true
            },
            show: false
        });
        windowState.manage(browserWindow);

        this.windows[windowName] = new AppWindow(this.ipcMain, browserWindow);

        this.windows[windowName].browserWindow.loadURL(url.format({
            pathname: path.join(__dirname, '../ui/canvas_designer.html'),
            protocol: 'file:',
            slashes: true
        }));
        this.windows[windowName].browserWindow.webContents.once('did-finish-load', () => {
            this.windows[windowName].browserWindow.show();
        });
        this.windows[windowName].browserWindow.setMenu(null);

        //this.windows[windowName].browserWindow.webContents.openDevTools();

        this.windows[windowName].browserWindow.on('closed', () => {
            this.windows[windowName] = null;
        });
    }

    createCanvasWindow() {
        let basepath = app.getAppPath();
        switch (os.platform()) {
            case 'linux':

                break;
            case 'darwin':
                let command;
                let pathToElectron;
                if (is.development) {
                    pathToElectron = basepath.replace("/Contents/Resources/default_app.asar", "");
                    pathToElectron += ' --args ' + pathToElectron.replace("/node_modules/electron/dist/Electron.app", "") + '/app/canvas/main.js';
                } else {
                    pathToElectron = basepath.replace("/Contents/Resources/app.asar", "");
                }
                command = "open -n " + pathToElectron;
                NativeMethods.execute('touch ' + process.env.HOME + '/.oh-presenter/SHOULD_OPEN_CANVAS');
                NativeMethods.execute(command);
                break;
            case 'win32':
                NativeMethods.execute('electron ./app/canvas/main &');
                break;
            default:

        }
    }

    createPresentationWindow() {
        let id = StringUtils.makeId();
        let windowName = 'presentationWindow_' + id;

        let windowState = windowStateKeeper({
            defaultWidth: 1200,
            defaultHeight: 700,
            file: 'presentationWindow.state'
        });
        let browserWindow = new BrowserWindow({
            x: windowState.x,
            y: windowState.y,
            width: windowState.width,
            height: windowState.height,
            minWidth: 700,
            minHeight: 500,
            titleBarStyle: "hidden",
            webPreferences: {
                experimentalFeatures: true
            },
            show: false
        });
        windowState.manage(browserWindow);

        this.windows[windowName] = new AppWindow(this.ipcMain, browserWindow);

        this.windows[windowName].browserWindow.loadURL(path.join("file:", __dirname,
            '../ui/presentation.html?windowId=' + windowName));
        this.windows[windowName].browserWindow.webContents.once('did-finish-load', () => {
            this.windows[windowName].browserWindow.show();
        });
        this.windows[windowName].browserWindow.setMenu(null);

        //this.windows[windowName].browserWindow.webContents.openDevTools();

        this.windows[windowName].browserWindow.on('close', (e) => {
            e.preventDefault();
            this.windows[windowName].browserWindow.webContents.executeJavaScript('VM.haveUnsavedChanges()', (result) => {
                if (result == false) {
                    this.windows[windowName].browserWindow.destroy();
                    this.windows[windowName] = null;
                } else {
                    this.windows[windowName].browserWindow.webContents.executeJavaScript('VM.close();');
                }
            });
        });
    }
}

module.exports = WindowManager;