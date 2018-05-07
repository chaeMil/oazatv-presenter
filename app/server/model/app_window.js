class AppWindow {
    constructor(ipcMain, browserWindow) {
        this.ipcMain = ipcMain;
        this.browserWindow = browserWindow;
    }
}

module.exports = AppWindow;