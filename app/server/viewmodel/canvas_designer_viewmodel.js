const BaseViewModel = require('../../shared/viewmodel/base_viewmodel');
const StringUtils = require('../../shared/util/string_utils');
const hotkeys = require('hotkeys-js');
const {dialog} = require('electron').remote;
const CacheService = require('../../shared/service/cache_service');
const fs = require('fs-extra');
const SystemFonts = require('system-font-families').default;
const AColorPicker = require('a-color-picker');
const Draggable = require('draggable');
const fabric = require('fabric').fabric;

require('../../shared/model/canvas/video');

class CanvasDesignerViewModel extends BaseViewModel {

    constructor(ko, ipcMain) {
        super(ko, ipcMain);
        this.cacheService = new CacheService();
        this.textEditorValues = {
            fontFamily: ko.observable(""),
            color: ko.observable("")
        };
        this.objectEditorValues = {
            id: ko.observable(""),
            scaleX: ko.observable(""),
            scaleY: ko.observable("")
        };
        this.videoControlValues = {
            videoTime: ko.observable(0),
            videoDuration: ko.observable(0)
        };
        this.canvasPropertiesValues = {
            color: ko.observable("#FFFFFF"),
        };
        this.canvasPropertiesValues.color.subscribe((newValue) => {
            this.canvas.backgroundColor = newValue;
            this.canvas.renderAll();
        });
        this.canvasFile = null;
        this.availableFonts = ko.observableArray();
        new SystemFonts().getFonts().then((fonts) => {
            fonts.forEach((font) => {
                if (!font.startsWith("."))
                    this.availableFonts.push(font);
            });
            this.availableFonts.sort();
        }, (error) => {
            console.log(error)
        });
    }

    init() {
        super.init();
        this._getUiElements();
        this._initCanvas();
        this._initHotKeys();

        this.ipcRenderer.on('window_interaction', (event, message) => {
            switch (message.action) {
                case 'import_from_canvas_designer':
                    this._onImportFromCanvasDesigner(message.data);
                    break;
            }
        });
    }

    saveCanvas() {
        let jsonCanvasData = this.canvas.toJSON(['id']);
        if (this.canvasFile != null) {

        } else {
            dialog.showSaveDialog({
                filters: [
                    {name: 'text', extensions: ['ohcanvas']}
                ]
            }, (fileName) => {
                if (fileName === undefined) return;
                fs.writeFile(fileName, JSON.stringify(jsonCanvasData), (error) => {
                    if (error != null) {
                        console.error("saveCanvas", error);
                        dialog.showErrorBox("Error", "An error occurred when trying to save the file: \n\n" + error);
                    }
                });
            });
        }
    }

    loadCanvas() {
        dialog.showOpenDialog({
                properties: ['openFile'],
                filters: [
                    {name: 'Canvas File', extensions: ['ohcanvas']},
                ]
            }, (files) => {
                if (files !== undefined && files[0] != null) {
                    let file = files[0];
                    fs.readFile(file, 'utf-8', (err, data) => {
                        if (err != null) {
                            console.error("loadCanvas", err);
                            dialog.showErrorBox("Error", "An error occurred when trying to load the file: \n\n" + err);
                        } else {
                            this.canvas.loadFromJSON(data, () => {
                                this.canvas.renderAll();
                                this.canvasPropertiesValues.color = this.canvas.backgroundColor
                            });
                        }
                    });
                }
            }
        );
    }

    deleteSelectedObjects() {
        let activeObject = this.canvas.getActiveObject();
        let activeGroup = this.canvas.getActiveObjects();
        if (activeGroup.length === 1) {
            this.canvas.remove(activeObject);
        }
        else if (activeGroup) {
            activeGroup.forEach((object) => {
                this.canvas.remove(object);
            });
            this.canvas.discardActiveObject(null);
            this.canvas.renderAll();
        }
    }

    selectAllObjects() {
        this.canvas.discardActiveObject(null);
        let sel = new fabric.ActiveSelection(this.canvas.getObjects(), {
            canvas: this.canvas,
        });
        this.canvas.setActiveObject(sel);
        this.canvas.requestRenderAll();
    }

    addRectangle() {
        let rectangle = new fabric.Rect({
            id: StringUtils.makeId(),
            left: 15,
            top: 15,
            fill: '',
            width: 100,
            height: 100,
            stroke: 'red',
            strokeWidth: 3,
            lockUniScaling: true
        });
        rectangle.set('selectable', true);
        this.canvas.add(rectangle);
    }

    addCircle() {
        let circle = new fabric.Circle({
            id: StringUtils.makeId(),
            radius: 50,
            left: 100,
            top: 100,
            fill: '',
            stroke: 'red',
            strokeWidth: 3,
            lockUniScaling: true
        });
        circle.set('selectable', true);
        this.canvas.add(circle);
    }

    addText() {
        let text = new fabric.IText('text', {
            id: StringUtils.makeId(),
            fontFamily: 'helvetica',
            left: 100,
            top: 100,
            fill: "#FF0000",
            statefullCache: true,
            lockUniScaling: true
        });
        text.set('selectable', true);
        this.canvas.add(text);
    }

    addTextbox() {
        let text = new fabric.Textbox('textbox', {
            id: StringUtils.makeId(),
            fontFamily: 'helvetica',
            left: 100,
            top: 100,
            statefullCache: true,
            lockUniScaling: true
        });
        text.set('selectable', true);

        text.setControlsVisibility({
            mt: false,
            mb: false,
            ml: true,
            mr: true,
            bl: false,
            br: false,
            tl: false,
            tr: false,
            mtr: false,
            lockUniScaling: true
        });

        this.canvas.on('text:changed', (opt) => {
            let text = opt.target;
            if (text.width > text.fixedWidth) {
                text.fontSize *= text.fixedWidth / (text.width + 1);
                text.width = text.fixedWidth;
            }
        });

        this.canvas.add(text);
    }

    addVideo() {
        dialog.showOpenDialog({
                properties: ['openFile'],
                filters: [
                    {name: 'Videos', extensions: ['mp4', 'mov', 'webm']},
                ]
            },
            (files) => {
                if (files !== undefined && files[0] != null) {
                    let file = files[0];
                    this.cacheService.addFileToCache(file, (cachedFile) => {
                        let self = this;
                        let videoId = StringUtils.makeId();
                        let videoElement = document.createElement('video');
                        videoElement.id = videoId;
                        videoElement.src = cachedFile;
                        videoElement.autoplay = true;
                        videoElement.volume = 0;
                        videoElement.setAttribute("style", "pointer-events: none; width: 1920px; height: 1080px");
                        document.body.appendChild(videoElement);

                        let video = new fabric.Video(videoElement, {
                            id: StringUtils.makeId(),
                            left: 200,
                            top: 300,
                            width: 1920,
                            height: 1080,
                            scaleY: 0.3,
                            scaleX: 0.3,
                            stroke: "#FF0000",
                            strokeWidth: 5,
                            originX: 'center',
                            originY: 'center',
                            videoId: videoId
                        });
                        video.set('selectable', true);

                        self.canvas.add(video);
                        /*fabric.util.requestAnimFrame(function render() {
                            self.canvas.renderAll();
                            fabric.util.requestAnimFrame(render);
                        });*/
                    });
                }
            }
        );
    }

    addImage() {
        dialog.showOpenDialog({
                properties: ['openFile'],
                filters: [
                    {name: 'Images', extensions: ['jpg', 'png']},
                ]
            },
            (files) => {
                if (files !== undefined && files[0] != null) {
                    let file = files[0];
                    this.cacheService.addFileToCache(file, (cachedFile) => {
                        fabric.Image.fromURL(cachedFile,
                            (img) => {
                                this.canvas.add(img).renderAll().setActiveObject(img);
                            },
                            {
                                id: StringUtils.makeId(),
                                lockUniScaling: true
                            });
                    });
                }
            }
        );
    }

    broadcastToCanvas() {
        let jsonData = this.canvas.toJSON(['id']);
        this._processVideoElements(jsonData);
        console.log("broadcastToCanvas", jsonData);
        this.ipcRenderer.send('broadcast', {
            action: 'canvas_json',
            value: JSON.stringify(jsonData)
        });
    }

    _processVideoElements(jsonData) {
        jsonData.objects.forEach((object) => {
            if (object.type === "video") {
                let videoElement = document.getElementById(object.videoId);
                object.videoTime = videoElement.currentTime;
                console.log(videoElement.currentTime);
            }
        });
    }

    _changeSelectedObjectAttribute(attributeName, value) {
        if (this.selectedObject != null) {
            if (this.selectedObject.type === "video" && attributeName === "videoTime") {
                let videoId = this.selectedObject.videoId;
                let videoElement = document.getElementById(videoId);
                videoElement.currentTime = value;
            }
            this.selectedObject[attributeName] = value;
            this.canvas.renderAll();
        }
    }

    _onObjectSelected() {
        this.objectEditor.classList.remove("hidden");
        this.objectEditorValues.id(this.selectedObject.id);
        this.objectEditorValues.scaleX(this.selectedObject.scaleX);
        this.objectEditorValues.scaleY(this.selectedObject.scaleY);

        this.objectEditorValues.id.subscribe((newValue) => {
            if (newValue == null || newValue.length === 0)
                this._changeSelectedObjectAttribute('id', StringUtils.makeId());
            else
                this._changeSelectedObjectAttribute('id', newValue);
        });
        this.objectEditorValues.scaleX.subscribe((newValue) => {
            this._changeSelectedObjectAttribute('scaleX', newValue);
        });
        this.objectEditorValues.scaleY.subscribe((newValue) => {
            this._changeSelectedObjectAttribute('scaleY', newValue);
        });
    }

    _onTextSelected() {
        this.textEditor.classList.remove("hidden");
        this.textEditorValues.fontFamily(this.selectedObject.fontFamily);
        this.textEditorValues.color(this.selectedObject.fill);

        this.textEditorValues.fontFamily.subscribe((newValue) => {
            this._changeSelectedObjectAttribute('fontFamily', newValue);
        });
        this.textEditorValues.color.subscribe((newValue) => {
            this._changeSelectedObjectAttribute('fill', newValue);
        });
    }

    openCanvasColorPicker() {
        this.openColorPicker((color) => {
            this.canvasPropertiesValues.color(color)
        }, this.canvas.backgroundColor, false)
    }

    openTextEditorColorPicker() {
        this.openColorPicker((color) => {
            this.textEditorValues.color(color);
        }, this.textEditorValues.color())
    }

    openColorPicker(callback, color, showAlpha = true) {
        let pickerWindow = document.getElementById('color-picker');
        let windowDrag = document.getElementById('color-picker-header');
        let windowLimit = document.getElementById('window-content');
        let windowContent = document.querySelector('#color-picker window-content');
        windowContent.innerHTML = '';
        pickerWindow.classList.remove('hidden');
        let colorPickerDraggable = new Draggable(pickerWindow, {
            handle: windowDrag,
            //limit: windowLimit //TODO fix
        });
        AColorPicker.createPicker({
            attachTo: '#color-picker window-content',
            color: color,
            showAlpha: showAlpha
        }).onchange = (picker) => {
            callback(picker.color)
        }
    }

    _onVideoSelected() {
        this.videoControls.classList.remove("hidden");
        let videoId = this.selectedObject.videoId;
        let videoElement = document.getElementById(videoId);

        videoElement.ontimeupdate = () => {
            console.log(videoElement.currentTime);
            this.videoControlValues.videoTime(videoElement.currentTime);
            this.videoControlValues.videoDuration(videoElement.duration);
        };
    }

    _onRectangleSelected() {

    }

    _onCircleSelected() {

    }

    _onSelection(event) {
        if (event.selected && event.selected.length == 1) {
            this._onSelectionCleared(null);
            this.selectedObject = event.target;
            let type = this.selectedObject.get('type');
            this._onObjectSelected();
            this.canvasPropertiesEditor.classList.add("hidden");

            switch (type) {
                case "i-text":
                    this._onTextSelected();
                    break;
                case "rect":
                    this._onRectangleSelected();
                    break;
                case "circle":
                    this._onCircleSelected();
                    break;
                case "video":
                    this._onVideoSelected();
                    break;
            }
        } else {
            this._onSelectionCleared(event)
        }
    }

    _onSelectionCleared(event) {
        this.selectedObject = null;
        this.objectEditor.classList.add("hidden");
        this.textEditor.classList.add("hidden");
        this.videoControls.classList.add("hidden");
        this.hideColorPicker();
        this.canvasPropertiesEditor.classList.remove("hidden");
    }

    _onObjectModified(event) {
        let object = event.target;
        this.objectEditorValues.scaleX(object.scaleX);
        this.objectEditorValues.scaleY(object.scaleY);
    }

    _initCanvas() {
        this.canvasWrapper = document.querySelector('#canvas-wrapper');
        this.canvas = new fabric.Canvas('canvas', {
            selection: true,
            uniScaleTransform: true,
            backgroundColor: '#FFFFFF'
        });

        this.canvas.on('selection:created', (event) => {
            this._onSelection(event);
        });
        this.canvas.on('selection:updated', (event) => {
            this._onSelection(event);
        });
        this.canvas.on('object:modified', (event) => {
            this._onObjectModified(event);
        });
        this.canvas.on('selection:cleared', (event) => {
            this._onSelectionCleared(event);
        });

        window.addEventListener('resize', () => {
            this._resizeCanvas();
        }, false);
        this._resizeCanvas();
    }

    _resizeCanvas() {
        let padding = 2 * 25;
        this.canvas.setWidth(this.canvasWrapper.offsetWidth - padding);
        this.canvas.setHeight((this.canvasWrapper.offsetWidth - padding) / (16 / 9));
        let scale = (this.canvasWrapper.offsetWidth - padding) / 1280;
        this.canvas.setZoom(scale);
        this.canvas.renderAll();
    }

    _getUiElements() {
        this.textEditor = document.querySelector('#text-editor');
        this.objectEditor = document.querySelector("#object-editor");
        this.videoControls = document.querySelector("#video-controls");
        this.canvasPropertiesEditor = document.querySelector("#canvas-properties-editor");
    }

    _initHotKeys() {
        hotkeys('backspace,delete', (event, handler) => {
            this.deleteSelectedObjects();
        });
        hotkeys('ctrl+a,command+a', (event, handler) => {
            this.selectAllObjects();
        });
        hotkeys('ctrl+o,command+o', (event, handler) => {
            this.loadCanvas();
        });
        hotkeys('ctrl+s,command+s', (event, handler) => {
            this.saveCanvas();
        });
    }

    hideColorPicker() {
        let colorPickerWindow = document.getElementById('color-picker');
        colorPickerWindow.classList.add('hidden');
    }

    _onImportFromCanvasDesigner(data) {
        let jsonData = this.canvas.toJSON(['id']);
        this.ipcRenderer.send('window_interaction', {
            action: 'on_import_from_canvas_designer_done',
            windowId: data.windowId,
            data: {
                canvasJsonData: jsonData
            }
        });
    }
}

module.exports = CanvasDesignerViewModel;