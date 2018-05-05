let {ipcRenderer, remote, webFrame} = require('electron');
let main = remote.require("./main.js");
let Photon = require("electron-photon");
let $ = require('jquery');

webFrame.setVisualZoomLevelLimits(1, 1);
webFrame.setLayoutZoomLevelLimits(0, 0);

//testing variables
let selectedClientId = null;

//test methods
$('#red').click(function () {
    if (!selectedClientId) {
        ipcRenderer.send('broadcast', {action: 'bg', value: 'red'});
    } else {
        ipcRenderer.send('broadcast', {clientHashIdFilter: selectedClientId, action: 'bg', value: 'red'});
    }
});

$('#blue').click(function () {
    if (!selectedClientId) {
        ipcRenderer.send('broadcast', {action: 'bg', value: 'blue'});
    } else {
        ipcRenderer.send('broadcast', {clientHashIdFilter: selectedClientId, action: 'bg', value: 'blue'});
    }
});

$('#green').click(function () {
    if (!selectedClientId) {
        ipcRenderer.send('broadcast', {action: 'bg', value: 'green'});
    } else {
        ipcRenderer.send('broadcast', {clientHashIdFilter: selectedClientId, action: 'bg', value: 'green'});
    }
});

$('#json').click(function () {
    ipcRenderer.send('broadcast', {
        action: 'canvas_json',
        value: $('#canvas-json-input').val()
    });
});
//test methods end

$('#get-clients-list').click(function () {
    getClientsList();
});

ipcRenderer.on('server_status', function (event, message) {
    if (message != null) {
        switch (message.action) {
            case 'get_clients_list':
                onGetClientsList(message.data);
                break;
        }
    }
});

$(document).ready(function () {
    $('.table-selectable').on('click', $('tr[data-client-id]'), function (event) {
        let clientRow = $(event.target).closest('tr[data-client-id]');
        selectedClientId = $(clientRow).attr('data-client-id');
    });

    setInterval(() => {
        getClientsList();
    }, 500);
});

function getClientsList() {
    ipcRenderer.send('server_status', 'get_clients_list');
}

function onGetClientsList(data) {
    let container = $('#clients-list');
    container.empty();
    Object.keys(data).forEach(clientHashId => {
        let client = data[clientHashId];
        container.append(`<tr data-client-id="${clientHashId}">
            <td>${client.clientDisplayName}</td>
            <td>${clientHashId}</td>
            <td>${client.host}</td>
            <td>${client.port}</td>
        </tr>`);
    });
}
