const BaseViewModel = require('../../shared/viewmodel/base_viewmodel');
const DataSet = require('../../shared/model/dataset/dataset');
const DataItem = require('../../shared/model/dataset/dataitem');
const hotkeys = require('hotkeys-js');
const DomUtils = require('../../shared/util/dom_utils');

class DataSetEditorViewModel extends BaseViewModel {

    constructor(ko, ipcRenderer) {
        super(ko, ipcRenderer);
        this.unsavedChanges = ko.observable(false);
        this.dataSets = ko.observableArray([]);
        this.newSetName = ko.observable("");
        this.selectedSet = null;
    }

    init() {
        super.init();
        this._initHotKeys();
        this._setupAddSetButton();
        this.selectedSetUI = document.querySelector("#selected-set-ui");
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
        this.dataSets.push(set);
        this.hideAddSetMenu();
    }

    onSetSelected(data) {
        this.selectedSet = data;
        let datasetsElements = document.querySelectorAll('#sets-list tr');
        datasetsElements.forEach((slideElement) => {
            slideElement.classList.remove('active');
        });
        let element = document.querySelector('#set_' + data.id);
        element.classList.add('active');
        this._generateSelectedSetUI();
    }

    _generateSelectedSetUI() {
        this.selectedSetUI.innerHTML = '';
        if (this.selectedSet != null) {
            this.selectedSet.data.forEach((item) => {
                if (typeof item.value === 'string') {
                    this._appendStringEditorToSelectedSetUI(item);
                }
            });
        }
    }

    _appendStringEditorToSelectedSetUI(item) {
        let ui = DomUtils.htmlToElement(`
            <input type="text" class="topcoat-text-input--large" value="" placeholder="name">
            <input type="text" class="topcoat-text-input--large" value="" placeholder="value">
        `);
        this.selectedSetUI.appendChild(ui);
    }

    addItemToSelectedSet() {
        if (this.selectedSet != null) {
            let item = new DataItem("", "");
            this.selectedSet.data.push(item);
            this._generateSelectedSetUI();
        }
    }

    loadDataSet() {

    }

    saveDataSet() {

    }
}

module.exports = DataSetEditorViewModel;