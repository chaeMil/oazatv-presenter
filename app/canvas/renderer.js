let {ipcRenderer, remote, webFrame} = require('electron');
let main = remote.require("./main.js");
let $ = require('jquery');

webFrame.setVisualZoomLevelLimits(1, 1);
webFrame.setLayoutZoomLevelLimits(0, 0);

ipcRenderer.on('data', function (event, data) {
    if (data.action == 'bg') {
        $('body').css('background-color', data.value);
    }
});