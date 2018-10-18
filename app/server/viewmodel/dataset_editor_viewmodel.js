const BaseViewModel = require('../../shared/viewmodel/base_viewmodel');
const DataSet = require ('../../shared/model/dataset/dataset');
const hotkeys = require('hotkeys-js');

class DataSetEditorViewModel extends BaseViewModel {

    constructor(ko, ipcRenderer) {
        super(ko, ipcRenderer);
        this.unsavedChanges = ko.observable(false);
        this.dataSet = ko.observableArray([]);
        this.newSetName = ko.observable("");
    }

    init() {
        super.init();
        this._initHotKeys();
        this._setupAddSetButton();
    }

    _setupAddSetButton() {
        this.newSetName.subscribe((newValue) => {
            if (newValue.trim().length === 0) {
                document.querySelector("#add-set-button").setAttribute("disabled", "disabled");
            } else {
                document.querySelector("#add-set-button").removeAttribute("disabled");
            }
        });
    }

    _initHotKeys() {
        hotkeys('escape', (event, handler) => {
            this.hideAddSetMenu();
        });
        hotkeys('ctrl+o,command+o', (event, handler) => {
            this.loadDataSet();
        });
        hotkeys('ctrl+s,command+s', (event, handler) => {
            this.saveDataSet(() => {
                //TODO saved
            });
        });
    }

    showAddSetMenu() {
        this.newSetName("");
        document.querySelector("#add-set-menu").classList.remove("hidden");
    }

    hideAddSetMenu() {
        document.querySelector("#add-set-menu").classList.add("hidden");
    }

    addSet() {
        let set = new DataSet(this.newSetName(), []);
        this.dataSet.push(set);
        this.hideAddSetMenu();
    }

    onSetSelected(data) {

    }

    loadDataSet() {

    }

    saveDataSet() {

    }
}

module.exports = DataSetEditorViewModel;