const electron = require('electron');
const {app, ipcMain} = electron;

const config = require('../shared/config');
const Server = require('./service/server.js');
const WindowManager = require('./service/window_manager');
let server = new Server(config.serverPort, serverStatusCallback);
let windowManager = new WindowManager(ipcMain);

app.on('ready', function () {
    init();
});

function init() {
    let onMainWindowClosed = () => {
        app.quit();
    };

    server.run();
    windowManager.createMainWindow(onMainWindowClosed);
}

function serverStatusCallback(type, action, data) {
    sendMessageToWindow(type, action, data);
}

ipcMain.on('broadcast', (event, arg) => {
    if (arg.hasOwnProperty('clientHashIdFilter')) {
        server.broadcast(arg, arg.clientHashIdFilter)
    } else {
        server.broadcast(arg);
    }
});

ipcMain.on('open_window', (event, arg) => {
    switch (arg.windowType) {
        case 'canvas_designer':
            windowManager.openCanvasDesignerWindow();
            break;
    }
});

function sendMessageToWindow(window, type, action, data) {
    windowManager.getWindow(window).webContents.send(type, {
        action: action,
        data: data
    });
}

ipcMain.on('server_status', (event, arg) => {
        if (arg == 'get_clients_list') {
            sendMessageToWindow('mainWindow', 'server_status', 'get_clients_list', server.getClientsList());
        }
    }
);

app.on('window-all-closed', function () {
    //if (process.platform !== 'darwin') {
    app.quit();
    //}
});