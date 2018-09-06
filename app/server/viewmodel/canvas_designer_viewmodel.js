const BaseViewModel = require('../../shared/viewmodel/base_viewmodel');
const StringUtils = require('../../shared/util/string_utils');
const hotkeys = require('hotkeys-js');
const {dialog} = require('electron').remote;
const CacheService = require('../../shared/service/cache_service');
const fs = require('fs-extra');
const fontList = require('font-list');

require('../../shared/model/canvas/video');

let fabric = require('fabric').fabric;

class CanvasDesignerViewModel extends BaseViewModel {

    constructor(ko, ipcMain) {
        super(ko, ipcMain);
        this.cacheService = new CacheService();
        this.textEditorValues = {
            fontFamily: ko.observable(""),
            color: ko.observable("")
        };
        this.objectEditorValues = {
            scaleX: ko.observable(""),
            scaleY: ko.observable("")
        };
        this.videoControlValues = {
            videoTime: ko.observable(0),
            videoDuration: ko.observable(0)
        };
        this.canvasFile = null;
        this.availableFonts = ko.observableArray();
        fontList.getFonts()
            .then(fonts => {
                fonts.forEach((font) => {
                    this.availableFonts.push(font);
                });
                this.availableFonts.sort();
            })
            .catch(err => {
                console.log(err)
            });
    }

    init() {
        super.init();
        this._getUiElements();
        this._initCanvas();
        this._initHotKeys();
    }

    saveCanvas() {
        let jsonCanvasData = this.canvas.toJSON();
        if (this.canvasFile != null) {

        } else {
            dialog.showSaveDialog({
                filters: [
                    {name: 'text', extensions: ['ohcanvas']}
                ]
            }, (fileName) => {
                if (fileName === undefined) return;
                fs.writeFile(fileName, JSON.stringify(jsonCanvasData), (error) => {
                    console.error("saveCanvas", error);
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
                        } else {
                            this.canvas.loadFromJSON(data, () => {
                                this.canvas.renderAll();
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
            left: 15,
            top: 15,
            fill: '',
            width: 100,
            height: 100,
            stroke: 'red',
            strokeWidth: 3
        });
        rectangle.set('selectable', true);
        this.canvas.add(rectangle);
    }

    addCircle() {
        let circle = new fabric.Circle({
            radius: 50,
            left: 100,
            top: 100,
            fill: '',
            stroke: 'red',
            strokeWidth: 3
        });
        circle.set('selectable', true);
        this.canvas.add(circle);
    }

    addText() {
        let text = new fabric.IText('text', {
            fontFamily: 'helvetica',
            left: 100,
            top: 100
        });
        text.set('selectable', true);
        this.canvas.add(text);
    }

    addTextbox() {
        let text = new fabric.Textbox('textbox', {
            fontFamily: 'helvetica',
            left: 100,
            top: 100
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
                        fabric.util.requestAnimFrame(function render() {
                            self.canvas.renderAll();
                            fabric.util.requestAnimFrame(render);
                        });
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
                        fabric.Image.fromURL(cachedFile, (img) => {
                            this.canvas.add(img).renderAll().setActiveObject(img);
                        });
                    });
                }
            }
        );
    }

    broadcastToCanvas() {
        let jsonData = this.canvas.toJSON();
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
                object.videoTime = videoElement.currentTime
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
        this.objectEditorValues.scaleX(this.selectedObject.scaleX);
        this.objectEditorValues.scaleY(this.selectedObject.scaleY);

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
        this.textEditorValues.color(this.selectedObject.color);

        this.textEditorValues.fontFamily.subscribe((newValue) => {
            this._changeSelectedObjectAttribute('fontFamily', newValue);
        });
        this.textEditorValues.color.subscribe((newValue) => {
            this._changeSelectedObjectAttribute('color', newValue);
        });
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
    }

    _initHotKeys() {
        hotkeys('backspace,delete', (event, handler) => {
            this.deleteSelectedObjects();
        });
        hotkeys('ctrl+a,command+a', (event, handler) => {
            this.selectAllObjects();
        });
    }
}

module.exports = CanvasDesignerViewModel;