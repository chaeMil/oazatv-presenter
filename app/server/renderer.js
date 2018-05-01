let {ipcRenderer, remote, webFrame} = require('electron');
let main = remote.require("./main.js");
let Photon = require("electron-photon");
let $ = require('jquery');

webFrame.setVisualZoomLevelLimits(1, 1);
webFrame.setLayoutZoomLevelLimits(0, 0);

let clientIdInput = $('#client-id');


//test methods
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

$('#json').click(function () {
    ipcRenderer.send('broadcast', {
        action: 'canvas_json',
        value: '{"version":"2.2.3","objects":[{"type":"rect","version":"2.2.3","originX":"left","originY":"top","left":100,"top":100,"width":60,"height":70,"fill":"red","stroke":null,"strokeWidth":1,"strokeDashArray":null,"strokeLineCap":"butt","strokeLineJoin":"miter","strokeMiterLimit":10,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"clipTo":null,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","transformMatrix":null,"skewX":0,"skewY":0,"rx":0,"ry":0},{"type":"rect","version":"2.2.3","originX":"left","originY":"top","left":750,"top":550,"width":200,"height":180,"fill":"blue","stroke":null,"strokeWidth":1,"strokeDashArray":null,"strokeLineCap":"butt","strokeLineJoin":"miter","strokeMiterLimit":10,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"clipTo":null,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","transformMatrix":null,"skewX":0,"skewY":0,"rx":0,"ry":0},{"type":"rect","version":"2.2.3","originX":"left","originY":"top","left":250,"top":300,"width":60,"height":120,"fill":"green","stroke":null,"strokeWidth":1,"strokeDashArray":null,"strokeLineCap":"butt","strokeLineJoin":"miter","strokeMiterLimit":10,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"clipTo":null,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","transformMatrix":null,"skewX":0,"skewY":0,"rx":0,"ry":0}]}'
    });
});
//test methods end

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
