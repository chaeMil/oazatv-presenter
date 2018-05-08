import BaseViewModel from './base_viewmodel';

class MainViewModel extends BaseViewModel {
    clientsList;

    constructor(ko, ipcRenderer) {
        super(ko, ipcRenderer);
        this.selectedClientId = null;
        this.clientsList = ko.observable();
    }

    init() {
        super.init();

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
            this.ipcRenderer.send('broadcast', {
                clientHashIdFilter: this.selectedClientId,
                action: 'bg',
                value: 'blue'
            });
        }
    }

    greenButtonClick() {
        if (!this.selectedClientId) {
            this.ipcRenderer.send('broadcast', {action: 'bg', value: 'green'});
        } else {
            this.ipcRenderer.send('broadcast', {
                clientHashIdFilter: this.selectedClientId,
                action: 'bg',
                value: 'green'
            });
        }
    }

    jsonButtonClick() {
        this.ipcRenderer.send('broadcast', {
            action: 'canvas_json',
            value: '{"version":"2.2.3","objects":[{"type":"rect","version":"2.2.3","originX":"left","originY":"top","left":53,"top":72,"width":50,"height":50,"fill":"#f10da5","stroke":null,"strokeWidth":1,"strokeDashArray":null,"strokeLineCap":"butt","strokeLineJoin":"miter","strokeMiterLimit":10,"scaleX":2.28,"scaleY":2.28,"angle":0,"flipX":false,"flipY":false,"opacity":0.8,"shadow":null,"visible":true,"clipTo":null,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","transformMatrix":null,"skewX":0,"skewY":0,"rx":0,"ry":0},{"type":"rect","version":"2.2.3","originX":"left","originY":"top","left":190,"top":115,"width":50,"height":50,"fill":"#57a865","stroke":null,"strokeWidth":1,"strokeDashArray":null,"strokeLineCap":"butt","strokeLineJoin":"miter","strokeMiterLimit":10,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":0.8,"shadow":null,"visible":true,"clipTo":null,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","transformMatrix":null,"skewX":0,"skewY":0,"rx":0,"ry":0},{"type":"circle","version":"2.2.3","originX":"left","originY":"top","left":120,"top":196,"width":100,"height":100,"fill":"#1aa52c","stroke":null,"strokeWidth":1,"strokeDashArray":null,"strokeLineCap":"butt","strokeLineJoin":"miter","strokeMiterLimit":10,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":0.8,"shadow":null,"visible":true,"clipTo":null,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","transformMatrix":null,"skewX":0,"skewY":0,"radius":50,"startAngle":0,"endAngle":6.283185307179586}]}'
        });
    }

    openCanvasDesignerWindow() {
        this.ipcRenderer.send('open_window', {
            windowType: 'canvas_designer'
        });
    }

    openCanvasWindow() {
        this.ipcRenderer.send('open_window', {
            windowType: 'canvas'
        });
    }
}

module.exports = MainViewModel;