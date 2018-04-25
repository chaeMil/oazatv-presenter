let {ipcRenderer, remote} = require('electron');
let main = remote.require("./main.js");
let $ = require('jquery');

$('#red').click(function () {
    ipcRenderer.send('broadcast', {action: 'bg', value: 'red'});
});

$('#blue').click(function () {
    ipcRenderer.send('broadcast', {action: 'bg', value: 'blue'});
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
        console.log(client);
        container.append('<span>' + clientHashId + '@' + client.host + ':' + client.port
            + ' - ' + client.clientDisplayName + '</span>');
    });
}
