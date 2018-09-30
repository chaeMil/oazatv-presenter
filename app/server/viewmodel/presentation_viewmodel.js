const BaseViewModel = require('../../shared/viewmodel/base_viewmodel');

class MainViewModel extends BaseViewModel {

    constructor(ko, ipcRenderer) {
        super(ko, ipcRenderer);
    }

    init() {
        super.init();
    }

    savePresentation() {
        //TODO
    }

    loadPresentation() {
        //TODO
    }
}

module.exports = MainViewModel;