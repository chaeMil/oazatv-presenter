const BaseViewModel = require('../../shared/viewmodel/base_viewmodel');
const DataSet = require('../../shared/model/dataset/dataset');
const DataItem = require('../../shared/model/dataset/dataitem');
const hotkeys = require('hotkeys-js');
const DomUtils = require('../../shared/util/dom_utils');
const {dialog} = require('electron').remote;
const fs = require('fs-extra');

class DataSetEditorViewModel extends BaseViewModel {

    constructor(ko, ipcRenderer) {
        super(ko, ipcRenderer);
        this.unsavedChanges = ko.observable(false);
        this.dataSets = ko.observableArray([]);
        this.newSetName = ko.observable("");
        this.selectedSet = null;
        this.shouldShowAddItemToSelectedSet = ko.observable(false);
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
        this.shouldShowAddItemToSelectedSet(true);
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
            <span class="label">name: </span><input id="${item.id}_name" type="text" class="topcoat-text-input--large" value="${item.name}">
            <span class="label">value: </span><input id="${item.id}_value" type="text" class="topcoat-text-input--large" value="${item.value}">
        `);
        this.selectedSetUI.appendChild(ui);
        let nameInput = document.getElementById(`${item.id}_name`);
        let valueInput = document.getElementById(`${item.id}_value`);
        nameInput.onchange = (event) => {
            item.name = event.target.value
        };
        valueInput.onchange = (event) => {
            item.value = event.target.value
        }
    }

    addItemToSelectedSet() {
        if (this.selectedSet != null) {
            let item = new DataItem("", "");
            this.selectedSet.data.push(item);
            this._generateSelectedSetUI();
        }
        console.log(this.dataSets());
    }

    loadDataSet() {
        dialog.showOpenDialog({
                properties: ['openFile'],
                filters: [
                    {name: 'DataSet File', extensions: ['ohdata']},
                ]
            }, (files) => {
                if (files !== undefined && files[0] != null) {
                    let file = files[0];
                    fs.readFile(file, 'utf-8', (err, data) => {
                        if (err != null) {
                            console.error("loadDataSet", err);
                            dialog.showErrorBox("Error", "An error occurred when trying to load the file: \n\n" + err);
                        } else {
                            this.dataSets(JSON.parse(data));
                        }
                    });
                }
            }
        );
    }

    saveDataSet() {
        dialog.showSaveDialog({
            filters: [
                {name: 'text', extensions: ['ohdata']}
            ]
        }, (fileName) => {
            if (fileName === undefined) return;
            fs.writeFile(fileName, JSON.stringify(this.dataSets()), (error) => {
                if (error != null) {
                    console.error("saveDataSet", error);
                    dialog.showErrorBox("Error", "An error occurred when trying to save the file: \n\n" + error);
                }
            });
        });
    }
}

module.exports = DataSetEditorViewModel;