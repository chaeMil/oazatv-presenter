const BaseViewModel = require('../../shared/viewmodel/base_viewmodel');

class DataSetEditorViewModel extends BaseViewModel {

    constructor(ko, ipcRenderer) {
        super(ko, ipcRenderer);
    }

    init() {
        super.init();
    }
}

module.exports = DataSetEditorViewModel;