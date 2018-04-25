let {ipcRenderer, remote} = require('electron');
let main = remote.require("./main.js");
let $ = require('jquery');

ipcRenderer.on('data', function (event, data) {
    if (data.action == 'bg') {
        $('body').css('background-color', data.value);
    }
});