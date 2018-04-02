let {ipcRenderer, remote} = require('electron');

ipcRenderer.on('data', function (event, data) {
    console.log(data);
});