const electron = require('electron');
const {app, BrowserWindow, ipcRenderer, ipcMain} = electron;

const path = require('path');
const url = require('url');
require('./canvas.js');

let mainWindow;

function createWindow () {
    mainWindow = new BrowserWindow({width: 800, height: 600});
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'ui/canvas.html'),
        protocol: 'file:',
        slashes: true
    }));

    mainWindow.webContents.openDevTools();

    mainWindow.on('closed', function () {
        app.quit();
    })
}

app.on('ready', function() {
    createWindow();
});