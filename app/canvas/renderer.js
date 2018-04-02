let {ipcRenderer, remote} = require('electron');
let main = remote.require("./main.js");
let $ = require('jquery');

ipcRenderer.on('data', function (event, data) {
    let jsonData = JSON.parse(data);
    console.log(jsonData);
    if (jsonData.action == 'bg') {
        $('body').css('background-color', jsonData.value);
    }
});