const BaseViewModel = require('../../shared/viewmodel/base_viewmodel');
const fabric = require('fabric').fabric;
const StringUtils = require('../../shared/util/string_utils');
const {dialog} = require('electron').remote;
const fs = require('fs-extra');
const hotkeys = require('hotkeys-js');
const $ = require('jquery');
const {remote} = require('electron');
const CacheService = require('../../shared/service/cache_service');
const async = require('async');
const tar = require('tar');

class PresentationViewModel extends BaseViewModel {

    constructor(ko, ipcRenderer, windowId) {
        super(ko, ipcRenderer);
        this.windowId = windowId;
        this.slides = ko.observableArray([]);
        this.liveBroadcast = ko.observable(false);
        this.unsavedChanges = ko.observable(false);
    }

    init() {
        super.init();
        this._initCanvas();
        this._initHotKeys();
        this.cacheService = new CacheService();
        this.tempDir = CacheService.getTempLocation() + "/" + StringUtils.makeId() + "/";
    }

    _initCanvas() {
        this.canvasWrapper = document.querySelector('#canvas-wrapper');
        this.canvas = new fabric.Canvas('canvas', {
            selection: false,
            uniScaleTransform: true,
            backgroundColor: '#FFFFFF'
        });
        this.canvasHeadless = new fabric.Canvas('canvas_headless', {
            selection: false,
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
            this.savePresentation(() => {
                //TODO saved
            });
        });
        hotkeys('l', (event, handler) => {
            this.toggleLiveBroadcast();
        });
        hotkeys('space', (event, handler) => {
            if (!this.liveBroadcast()) {
                this.broadcastToCanvas(this.canvas.toJSON());
            }
        });
        hotkeys('backspace,delete', (event, handler) => {
            this.deleteCurrentSlide();
        });
        //TODO find way to do key navigation without jquery
        $(document).keydown((e) => {
            switch (e.which) {
                case 37: // left
                    break;

                case 38: // up
                    e.preventDefault();
                    this.previousSlide();
                    break;

                case 39: // right
                    break;

                case 40: // down
                    e.preventDefault();
                    this.nextSlide();
                    break;

                default:
                    return; // exit this handler for other keys
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

    savePresentation(callback) {
        dialog.showSaveDialog({
            filters: [
                {name: 'text', extensions: ['ohpres']}
            ]
        }, (fileName) => {
            async.series([() => {
                if (fileName === undefined) return;
                let slidesCopy = this.slides();
                let multimediaFiles = [];
                slidesCopy = slidesCopy.map((slide) => {
                    let objectsCopy = slide.jsonData.objects;
                    objectsCopy = objectsCopy.map((object) => {
                        if (object.type === "image") {
                            let localPath = CacheService.getLocalFilePath(object.src);
                            console.log(localPath);
                            let fileName = StringUtils.makeId();
                            fs.copySync(localPath, this.tempDir + fileName);
                            object.src = "presentation://" + fileName;
                            multimediaFiles.push(fileName);
                        }
                        return object;
                    });
                    slide.jsonData.objects = objectsCopy;
                    return slide;
                });
                let fileContent = JSON.stringify(slidesCopy);
                fs.writeFileSync(this.tempDir + "slides.json", fileContent);
                let filesToTar = ["slides.json"];
                multimediaFiles.forEach((file) => {
                    filesToTar.push(file);
                });
                tar.c({
                        cwd: this.tempDir,
                        gzip: false,
                        sync: true,
                        noDirRecurse: true,
                        file: fileName,
                    },
                    filesToTar);
                this.unsavedChanges(false);
                callback();
            }]);
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
                    async.series([() => {
                        let file = files[0];
                        let tempExtractDir = CacheService.getTempLocation() + "/open_presentation/" + StringUtils.makeId() + "/";
                        fs.mkdirpSync(tempExtractDir);
                        tar.x({
                            file: file,
                            cwd: tempExtractDir,
                            sync: true,
                        });
                        fs.readFile(tempExtractDir + "slides.json", 'utf-8', (err, data) => {
                            if (err != null) {
                                console.error("loadPresentation", err);
                            } else {
                                let slidesJson = JSON.parse(data);
                                console.log(slidesJson);
                                slidesJson.map((slide) => {
                                    slide.jsonData.objects.map((object) => {
                                        if (object.type === "image") {
                                            let externalFilePath = object.src.replace("presentation://", tempExtractDir);
                                            this.cacheService.addFileToCache(externalFilePath, (cachedFile) => {
                                                console.log(cachedFile);
                                                object.src = cachedFile;
                                            });
                                        }
                                        return object;
                                    });
                                    return slide;
                                });
                                this.onLoadPresentationSuccess(JSON.stringify(slidesJson));
                            }
                        });
                    }]);
                }
            }
        );
    }

    onLoadPresentationSuccess(data) {
        let parsedData = JSON.parse(data);
        this.slides(parsedData);
        this.slides().forEach((slide) => {
            this._generateSlidePreview(slide);
        });
        setTimeout(() => {
            let firstSlide = this.slides()[0];
            this.onSlideSelected(firstSlide);
        }, 50); //TODO ugly need to find different way to select the first slide
    }

    _generateSlidePreview(slide) {
        this.canvasHeadless.loadFromJSON(slide.jsonData, () => {
            this.canvasHeadless.renderAll();
            let preview = this.canvasHeadless.toDataURL('jpg');
            let slideElementPreview = document.querySelector("#slide_" + slide.id + " img");
            slideElementPreview.src = preview;
        });
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

    deleteCurrentSlide() {
        if (this.currentSlide != null) {
            let modifiedSlides = this.slides().filter((slide) => {
                return slide !== this.currentSlide;
            });
            this.slides(modifiedSlides);
            let newSelectedSlide = null;
            if (this.slides()[this.selectedSlideIndex - 1] != null) {
                newSelectedSlide = this.slides()[this.selectedSlideIndex - 1];
            } else if (this.slides()[this.selectedSlideIndex] != null) {
                newSelectedSlide = this.slides()[this.selectedSlideIndex];
            } else {
                newSelectedSlide = null;
            }
            this.onSlideSelected(newSelectedSlide);
            this.unsavedChanges(true);
        }
    }

    _onImportFromCanvasDesignerDone(data) {
        let slideId = StringUtils.makeId();
        let slide = {
            id: slideId,
            name: 'Unnamed Slide',
            jsonData: data.canvasJsonData
        };
        this.slides.push(slide);
        this._generateSlidePreview(slide);
        this.unsavedChanges(true);
    }

    onSlideSelected(data) {
        if (data == null) {
            this._initCanvas();
        }
        this.currentSlide = data;
        this.selectedSlideIndex = this.slides().indexOf(data);
        let slidesElements = document.querySelectorAll('#slides-list tr');
        slidesElements.forEach((slideElement) => {
            slideElement.classList.remove('active');
        });
        if (data != null) {
            let element = document.querySelector('#slide_' + data.id);
            element.classList.add('active');
            if (!this._checkIfInView(element)) {
                element.scrollIntoView();
            }
            if (this.liveBroadcast()) {
                this.broadcastToCanvas(data.jsonData);
            }
            this.canvas.loadFromJSON(data.jsonData);
        } else {
            if (this.liveBroadcast()) {
                this.broadcastToCanvas(this.canvas.toJSON());
            }
        }
    }

    toggleLiveBroadcast() {
        this.liveBroadcast(!this.liveBroadcast());
        if (this.liveBroadcast()) {
            this.broadcastToCanvas(this.canvas.toJSON());
        }
    }

    broadcastToCanvas(data) {
        if (data === undefined) {
            //set current slide
            data = this.slides()[this.selectedSlideIndex].jsonData;
        }
        this.ipcRenderer.send('broadcast', {
            action: 'canvas_json',
            value: JSON.stringify(data)
        });
    }

    _selectSlideAtIndex(index) {
        if (this.slides()[index] != null) {
            this.onSlideSelected(this.slides()[index]);
        }
    }

    previousSlide() {
        this._selectSlideAtIndex(this.selectedSlideIndex - 1);
    }

    nextSlide() {
        this._selectSlideAtIndex(this.selectedSlideIndex + 1);
    }

    _checkIfInView(element) {
        let offset = $(element).offset().top - $(window).scrollTop();

        if (offset > window.innerHeight || offset < 0) {
            // Not in view so scroll to it
            $('html,body').animate({scrollTop: offset}, 1000);
            return false;
        }
        return true;
    }

    close() {
        let choice = dialog.showMessageBox(
            remote.getCurrentWindow(), {
                type: 'question',
                buttons: ['Save and close...', 'Close'],
                title: 'Confirm',
                message: 'Unsaved content, are you shure you want to close the window?'
            });
        if (choice === 0) {
            this.savePresentation(() => {
                this._destroyWindow();
            });
        } else {
            this._destroyWindow();
        }
    }

    _destroyWindow() {
        this.ipcRenderer.send('window_operation', {
            action: 'destroy',
            data: {
                windowId: this.windowId
            }
        });
    }

    haveUnsavedChanges() {
        return this.unsavedChanges();
    }
}

module.exports = PresentationViewModel;