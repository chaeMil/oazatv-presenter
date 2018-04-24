const electron = require('electron');
const {app, BrowserWindow, ipcRenderer, ipcMain} = electron;

const path = require('path');
const url = require('url');
const config = require('../shared/config');
const Server = require('./server.js');
let server = new Server(config.serverPort);
server.run();

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({width: 350, height: 200});
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'ui/server.html'),
        protocol: 'file:',
        slashes: true
    }));

    //mainWindow.webContents.openDevTools();

    mainWindow.on('closed', function () {
        mainWindow = null
    })
}

ipcMain.on('sync', (event, arg) => {
    console.log(arg);
    server.broadcast(arg);
});

app.on('ready', function () {
    createWindow();
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow()
    }
});