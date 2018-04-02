let {ipcRenderer, remote} = require('electron');
let main = remote.require("./main.js");
let $ = require('jquery');

$('#red').click(function () {
    ipcRenderer.send('sync', {action: 'bg', value: 'red'});
});

$('#blue').click(function () {
    ipcRenderer.send('sync', {action: 'bg', value: 'blue'});
});