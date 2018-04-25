const electron = require('electron');
const {app, BrowserWindow, ipcRenderer, ipcMain} = electron;
const path = require('path');
const url = require('url');
const config = require('../shared/config');
const Client = require('./client');

let mainWindow;

let onDataReceivedCallback = function(data) {
    mainWindow.webContents.send('data', data);
};

let client = new Client(config.clientPort, config.serverPort, onDataReceivedCallback, 0, 3, true, 'Test canvas');
client.create();

function createWindow () {
    mainWindow = new BrowserWindow({width: 350, height: 200});
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'ui/canvas.html'),
        protocol: 'file:',
        slashes: true
    }));

    //mainWindow.webContents.openDevTools();

    mainWindow.on('closed', function () {
        client.disconnect(() => {
            app.quit();
        });
    })
}

app.on('ready', function() {
    createWindow();
});