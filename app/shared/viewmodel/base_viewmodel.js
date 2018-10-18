const os = require("os");

class BaseViewModel {
    constructor(ko, ipcRenderer) {
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