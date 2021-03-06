const BaseViewModel = require('../../shared/viewmodel/base_viewmodel');
require('../../shared/model/canvas/video');
let {webFrame} = require('electron');
const hotkeys = require('hotkeys-js');

webFrame.setVisualZoomLevelLimits(1, 1);
webFrame.setLayoutZoomLevelLimits(0, 0);

class CanvasViewModel extends BaseViewModel {

    constructor(ko, ipcRenderer) {
        super(ko, ipcRenderer);
    }

    init() {
        super.init();
        this._initCanvas();
        this._initMessaging();
        this._initHotkeys();
    }

    _initCanvas() {
        this.canvasWrapper = document.querySelector('#canvas-wrapper');
        this.canvas = new fabric.Canvas('canvas', {
            selection: false,
            uniScaleTransform: true,
            backgroundColor: '#FFFFFF'
        });

        window.addEventListener('resize', () => {
            this._resizeCanvas();
        }, false);
        this._resizeCanvas();
    }

    //TODO fix scaling
    _resizeCanvas() {
        let width = this.canvasWrapper.offsetHeight / (9 / 16);
        let height = this.canvasWrapper.offsetWidth / (16 / 9);
        this.canvas.setWidth(width);
        this.canvas.setHeight(height);
        let scale = 1;
        if (width > height) {
            scale = this.canvasWrapper.offsetWidth / 1280;
        } else {
            scale = this.canvasWrapper.offsetHeight / 720;
        }
        this.canvas.setZoom(scale);
        this.canvas.renderAll();
    }

    _processVideoElements(canvasJson) {
        let basicCanvasJson = {};
        basicCanvasJson.objects = [];
        basicCanvasJson.background = canvasJson.background;
        let videosCanvasJson = {};
        videosCanvasJson.objects = [];
        canvasJson.objects.forEach((item) => {
            if (item.type === "video") {
                videosCanvasJson.objects.push(item);
            } else {
                basicCanvasJson.objects.push(item);
            }
        });
        return {
            basicCanvasJson: basicCanvasJson,
            videosCanvasJson: videosCanvasJson
        };
    }

    _initMessaging() {
        this.ipcRenderer.on('data', (event, data) => {
            switch (data.action) {
                case 'bg':
                    this.canvas.backgroundColor = data.value;
                    this.canvas.renderAll();
                    break;
                case 'canvas_json':
                    this._processCanvasJson(data.value);
                    break;
            }
        });

        this.ipcRenderer.on('connection', (event, value) => {
            if (value) {
                document.querySelector('#connection-status').classList.add('connected');
            } else {
                document.querySelector('#connection-status').classList.remove('connected');
            }
        });
    }

    _processCanvasJson(data) {
        let canvasJson = JSON.parse(data);
        console.log("canvas_json", canvasJson);
        this._removeVideoElements();
        let processedCanvases = this._processVideoElements(canvasJson);
        this.canvas.loadFromJSON(processedCanvases.basicCanvasJson, () => {
            this.canvas.renderAll();
        }, (o, object) => {
            //console.log(o, object)
        });
        processedCanvases.videosCanvasJson.objects.forEach((video) => {
            this._addVideo(video);
        });
        let self = this;
        /*fabric.util.requestAnimFrame(function render() {
            self.canvas.renderAll();
            fabric.util.requestAnimFrame(render);
        });*/
    }

    _addVideo(object) {
        let videoElement = document.createElement('video');
        videoElement.id = object.videoId;
        videoElement.src = object.src;
        videoElement.autoplay = true;
        videoElement.currentTime = object.videoTime;
        videoElement.setAttribute("style", "pointer-events: none; width: 1920px; height: 1080px; position: absolute; top: -1080px; left: 0px");
        document.body.appendChild(videoElement);

        let video = new fabric.Video(videoElement, {
            videoId: object.videoId,
            src: null,
            left: object.left,
            top: object.top,
            width: object.width,
            height: object.height,
            scaleY: object.scaleY,
            scaleX: object.scaleX,
            originX: object.originX,
            originY: object.originY
        });
        video.set('selectable', false);

        this.canvas.add(video);
    }

    _removeVideoElements() {
        let objects = this.canvas.getObjects();
        objects.forEach((object) => {
            if (object.type === "video") {
                this.canvas.remove(object);
            }
        });
        [].forEach.call(document.querySelectorAll('video'), (e) => {
            e.parentNode.removeChild(e);
        });
    }

    _initHotkeys() {
        hotkeys('escape', (event, handler) => {
            this.ipcRenderer.send('exit_fullscreen');
        });
    }
}

module.exports = CanvasViewModel;