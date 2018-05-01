const electron = require('electron');
const {app, BrowserWindow, ipcRenderer, ipcMain} = electron;
const path = require('path');
const url = require('url');

const config = require('../shared/config');
const Server = require('./server.js');

function serverStatusCallback(type, action, data) {
    sendMessageToRenderThread(type, action, data);
}

let server = new Server(config.serverPort, serverStatusCallback);
server.run();

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 700,
        height: 600,
        titleBarStyle: "hidden",
        webPreferences: {
            experimentalFeatures: true
        }
    });
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'ui/server.html'),
        protocol: 'file:',
        slashes: true
    }));
    mainWindow.setMenu(null);

    mainWindow.webContents.openDevTools();

    mainWindow.on('closed', function () {
        mainWindow = null
    })
}

ipcMain.on('broadcast', (event, arg) => {
    if (arg.hasOwnProperty('clientHashIdFilter')) {
        server.broadcast(arg, arg.clientHashIdFilter)
    } else {
        server.broadcast(arg);
    }
});

function sendMessageToRenderThread(type, action, data) {
    mainWindow.webContents.send(type, {
        action: action,
        data: data
    });
}

ipcMain.on('server_status', (event, arg) => {
        if (arg == 'get_clients_list') {
            sendMessageToRenderThread('server_status', 'get_clients_list', server.getClientsList());
        }
    }
);

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