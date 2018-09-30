const BaseViewModel = require('../../shared/viewmodel/base_viewmodel');
const fabric = require('fabric').fabric;
const StringUtils = require('../../shared/util/string_utils');
const {dialog} = require('electron').remote;
const fs = require('fs-extra');
const hotkeys = require('hotkeys-js');

class PresentationViewModel extends BaseViewModel {

    constructor(ko, ipcRenderer, windowId) {
        super(ko, ipcRenderer);
        this.windowId = windowId;
        this.slides = ko.observableArray([]);
        this.liveBroadcast = ko.observable(false);
    }

    init() {
        super.init();
        this._initCanvas();
        this._initHotKeys();
    }

    _initCanvas() {
        this.canvasWrapper = document.querySelector('#canvas-wrapper');
        this.canvas = new fabric.Canvas('canvas', {
            selection: true,
            uniScaleTransform: true,
            backgroundColor: '#FFFFFF'
        });

        window.addEventListener('resize', () => {
            this._resizeCanvas();
        }, false);
        this._resizeCanvas();

        this.ipcRenderer.on('window_interaction', (event, message) => {
            switch (message.action) {
                case 'on_import_from_canvas_designer_done':
                    this._onImportFromCanvasDesignerDone(message.data);
                    break;
            }
        });
    }

    _initHotKeys() {
        hotkeys('escape', (event, handler) => {
            this.hideAddSlideMenu();
        });
        hotkeys('ctrl+o,command+o', (event, handler) => {
            this.loadPresentation();
        });
        hotkeys('ctrl+s,command+s', (event, handler) => {
            this.savePresentation();
        });
        hotkeys('l', (event, handler) => {
            this.toggleLiveBroadcast();
        });
        hotkeys('space', (event, handler) => {
            if (!this.liveBroadcast()) {
                this.broadcastToCanvas(this.canvas.toJSON());
            }
        });
    }

    _resizeCanvas() {
        let padding = 2 * 25;
        this.canvas.setWidth(this.canvasWrapper.offsetWidth - padding);
        this.canvas.setHeight((this.canvasWrapper.offsetWidth - padding) / (16 / 9));
        let scale = (this.canvasWrapper.offsetWidth - padding) / 1280;
        this.canvas.setZoom(scale);
        this.canvas.renderAll();
    }

    savePresentation() {
        dialog.showSaveDialog({
            filters: [
                {name: 'text', extensions: ['ohpres']}
            ]
        }, (fileName) => {
            if (fileName === undefined) return;
            let fileContent = JSON.stringify(this.slides()); //TODO add handling of multimedia contents
            fs.writeFile(fileName, fileContent, (error) => {
                console.error("savePresentation", error);
            });
        });
    }

    loadPresentation() {
        dialog.showOpenDialog({
                properties: ['openFile'],
                filters: [
                    {name: 'Presentation File', extensions: ['ohpres']},
                ]
            }, (files) => {
                if (files !== undefined && files[0] != null) {
                    let file = files[0];
                    fs.readFile(file, 'utf-8', (err, data) => {
                        if (err != null) {
                            console.error("loadPresentation", err);
                        } else {
                            let parsedData = JSON.parse(data);
                            this.slides(parsedData);
                        }
                    });
                }
            }
        );
    }

    showAddSlideMenu() {
        document.querySelector("#add-slide-menu").classList.remove("hidden");
    }

    hideAddSlideMenu() {
        document.querySelector("#add-slide-menu").classList.add("hidden");
    }

    addSlideFromCanvasDesigner() {
        this.hideAddSlideMenu();
        this.ipcRenderer.send('window_interaction', {
            windowId: 'canvasDesignerWindow',
            action: 'import_from_canvas_designer',
            data: {
                windowId: this.windowId
            }
        });
    }

    deleteSlide(data) {
        /*this.slides().forEach((slide) => {
            console.log(slide);
        });*/
    }

    _onImportFromCanvasDesignerDone(data) {
        let slideId = StringUtils.makeId();
        let slide = {
            id: slideId,
            name: 'Unnamed Slide',
            jsonData: data.canvasJsonData
        };
        this.slides.push(slide);
    }

    slidePreviewClick(data) {
        let slidesElements = document.querySelectorAll('#slides-list tr');
        slidesElements.forEach((slideElement) => {
            slideElement.classList.remove('active');
        });
        let element = document.querySelector('#slide_' + data.id);
        element.classList.add('active');
        if (this.liveBroadcast()) {
            this.broadcastToCanvas(data.jsonData);
        }
        this.canvas.loadFromJSON(data.jsonData);
    }

    toggleLiveBroadcast() {
        this.liveBroadcast(!this.liveBroadcast());
        if (this.liveBroadcast()) {
            this.broadcastToCanvas(this.canvas.toJSON());
        }
    }

    broadcastToCanvas(data) {
        this.ipcRenderer.send('broadcast', {
            action: 'canvas_json',
            value: JSON.stringify(data)
        });
    }
}

module.exports = PresentationViewModel;