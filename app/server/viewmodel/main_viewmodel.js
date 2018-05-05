class MainViewModel {
    clientsList;

    constructor(ko, ipcRenderer) {
        this.ipcRenderer = ipcRenderer;
        this.selectedClientId = null;
        this.clientsList = ko.observable();
    }

    init() {
        this.ipcRenderer.on('server_status', (event, message) => {
            if (message != null) {
                switch (message.action) {
                    case 'get_clients_list':
                        this.onGetClientsList(message.data);
                        break;
                }
            }
        });

        setInterval(() => {
            this.getClientsList();
        }, 500);

        ko.applyBindings(this);
    }

    getClientsList() {
        this.ipcRenderer.send('server_status', 'get_clients_list');
    }

    onGetClientsList(data) {
        this.clientsList(data);
    }

    redButtonClick() {
        if (!this.selectedClientId) {
            this.ipcRenderer.send('broadcast', {action: 'bg', value: 'red'});
        } else {
            this.ipcRenderer.send('broadcast', {clientHashIdFilter: this.selectedClientId, action: 'bg', value: 'red'});
        }
    }

    blueButtonClick() {
        if (!this.selectedClientId) {
            this.ipcRenderer.send('broadcast', {action: 'bg', value: 'blue'});
        } else {
            this.ipcRenderer.send('broadcast', {clientHashIdFilter: this.selectedClientId, action: 'bg', value: 'blue'});
        }
    }

    greenButtonClick() {
        if (!this.selectedClientId) {
            this.ipcRenderer.send('broadcast', {action: 'bg', value: 'green'});
        } else {
            this.ipcRenderer.send('broadcast', {clientHashIdFilter: this.selectedClientId, action: 'bg', value: 'green'});
        }
    }

    jsonButonClick() {
        this.ipcRenderer.send('broadcast', {
            action: 'canvas_json',
            value: $('#canvas-json-input').val()
        });
    }
}

module.exports = MainViewModel;