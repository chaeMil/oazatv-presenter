class BaseViewModel {
    constructor(ko, ipcRenderer) {
        this.ko = ko;
        this.ipcRenderer = ipcRenderer;
    }

    init() {
        this.ko.applyBindings(this);
    }
}

module.exports = BaseViewModel;