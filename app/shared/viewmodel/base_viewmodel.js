const {ipcRenderer} = require('electron');
const os = require("os");
const {is} = require('electron-util');
const unhandled = require('electron-unhandled');

class BaseViewModel {
    constructor(ko, ipcRenderer) {
        unhandled({
            showDialog: is.development,
            logger: error=> {
                console.error(error);
                if (!is.development) ipcRenderer.send('force_quit');
            }
        });
        this.ko = ko;
        this.ipcRenderer = ipcRenderer;
        window.addEventListener('load', () => {
            document.body.className += ' ' + os.platform();
        });
    }

    init() {
        this.applyBindings(this);
    }

    applyBindings(viewModel, htmlNode) {
        this.ko.applyBindings(viewModel, htmlNode);
    }
}


module.exports = BaseViewModel;