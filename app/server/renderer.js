let {ipcRenderer, webFrame} = require('electron');
let Photon = require("electron-photon");
let $ = require('jquery');

$('#get-clients-list').click(function () {
    getClientsList();
});

$(document).ready(function () {
    $('.table-selectable').on('click', $('tr[data-client-id]'), function (event) {
        let clientRow = $(event.target).closest('tr[data-client-id]');
        selectedClientId = $(clientRow).attr('data-client-id');
    });
});




