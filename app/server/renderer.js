let {ipcRenderer, remote, webFrame} = require('electron');
let main = remote.require("./main.js");
let Photon = require("electron-photon");
let $ = require('jquery');

webFrame.setVisualZoomLevelLimits(1, 1);
webFrame.setLayoutZoomLevelLimits(0, 0);

let clientIdInput = $('#client-id');

$('#red').click(function () {
    if (!clientIdInput.val()) {
        ipcRenderer.send('broadcast', {action: 'bg', value: 'red'});
    } else {
        ipcRenderer.send('broadcast', {clientHashIdFilter: clientIdInput.val(), action: 'bg', value: 'red'});
    }
});

$('#blue').click(function () {
    if (!clientIdInput.val()) {
        ipcRenderer.send('broadcast', {action: 'bg', value: 'blue'});
    } else {
        ipcRenderer.send('broadcast', {clientHashIdFilter: clientIdInput.val(), action: 'bg', value: 'blue'});
    }
});

$('#green').click(function () {
    if (!clientIdInput.val()) {
        ipcRenderer.send('broadcast', {action: 'bg', value: 'green'});
    } else {
        ipcRenderer.send('broadcast', {clientHashIdFilter: clientIdInput.val(), action: 'bg', value: 'green'});
    }
});


$('#get-clients-list').click(function () {
    ipcRenderer.send('server_status', 'get_clients_list');
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

function onGetClientsList(data) {
    let container = $('#clients-list');
    container.empty();
    Object.keys(data).forEach(clientHashId => {
        let client = data[clientHashId];
        container.append(`<tr>
            <td>${client.clientDisplayName}</td>
            <td>${clientHashId}</td>
            <td>${client.host}</td>
            <td>${client.port}</td>
        </tr>`);
    });
}
