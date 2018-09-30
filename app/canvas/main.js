const electron = require('electron');
const {app, BrowserWindow} = electron;
const windowStateKeeper = require('electron-window-state');
const path = require('path');
const url = require('url');

const config = require('../shared/config');
const Client = require('./client');

let canvasWindow;

let onDataReceivedCallback = function (data) {
    canvasWindow.webContents.send('data', data);
};

let onConnectionChangedCallback = function (value) {
    canvasWindow.webContents.send('connection', value);
};

let client = new Client(config.clientPort, config.serverPort,
    onDataReceivedCallback, onConnectionChangedCallback,
    0, 3, true, 'Test canvas');
client.create();

function createWindow() {
    let windowState = windowStateKeeper({
        defaultWidth: 800,
        defaultHeight: 600
    });
    canvasWindow = new BrowserWindow({
        x: windowState.x,
        y: windowState.y,
        width: windowState.width,
        height: windowState.height,
        fullScreen: windowState.isFullScreen,
        file: 'canvasWindow.state'
    });
    windowState.manage(canvasWindow);
    canvasWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'ui/canvas.html'),
        protocol: 'file:',
        slashes: true
    }));
    canvasWindow.setMenu(null);

    //canvasWindow.webContents.openDevTools();

    canvasWindow.on('closed', function () {
        client.disconnect(() => {
            app.quit();
        });
    })
}

app.on('ready', function () {
    createWindow();
});