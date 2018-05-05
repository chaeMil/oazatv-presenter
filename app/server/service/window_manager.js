import {BrowserWindow} from 'electron';
const path = require('path');
const url = require('url');
import NativeMethods from './native_methods';

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
            this.getWindow('mainWindow').show();
            return;
        }

        this.windows['mainWindow'] = new BrowserWindow({
            width: 800,
            height: 600,
            minWidth: 800,
            minHeight: 320,
            titleBarStyle: "hidden",
            webPreferences: {
                experimentalFeatures: true
            }
        });

        this.windows['mainWindow'].loadURL(url.format({
            pathname: path.join(__dirname, '../ui/main.html'),
            protocol: 'file:',
            slashes: true
        }));
        this.windows['mainWindow'].setMenu(null);

        this.windows['mainWindow'].webContents.openDevTools();

        this.windows['mainWindow'].on('closed', () => {
            this.windows['mainWindow'] = null;
            onWindowCloseCallback();
        });
    }

    openCanvasDesignerWindow() {
        if (this.getWindow('canvasDesignerWindow') != null) {
            this.getWindow('canvasDesignerWindow').show();
            return;
        }

        this.windows['canvasDesignerWindow'] = new BrowserWindow({
            width: 700,
            height: 600,
            minWidth: 640,
            minHeight: 480,
            titleBarStyle: "hidden",
            webPreferences: {
                experimentalFeatures: true
            }
        });

        this.windows['canvasDesignerWindow'].loadURL(url.format({
            pathname: path.join(__dirname, '../ui/canvas_designer.html'),
            protocol: 'file:',
            slashes: true
        }));
        this.windows['canvasDesignerWindow'].setMenu(null);

        this.windows['canvasDesignerWindow'].on('closed', function () {
            this.windows['canvasDesignerWindow'] = null;
        });
    }

    createCanvasWindow() {
        NativeMethods.execute('./node_modules/.bin/npm run canvas', (output) => {
            console.log(output);
        });
    }
}

module.exports = WindowManager;