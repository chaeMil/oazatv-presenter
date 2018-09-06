const BaseViewModel = require('../../shared/viewmodel/base_viewmodel');

require('../../shared/model/canvas/video');
let {webFrame} = require('electron');
let $ = require('jquery');

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

    _resizeCanvas() {
        this.canvas.setWidth(this.canvasWrapper.offsetWidth);
        this.canvas.setHeight(this.canvasWrapper.offsetWidth / (16 / 9));
        let scale = this.canvasWrapper.offsetWidth / 1280;
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
                $('#connection-status').addClass('connected');
            } else {
                $('#connection-status').removeClass('connected');
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
        fabric.util.requestAnimFrame(function render() {
            self.canvas.renderAll();
            fabric.util.requestAnimFrame(render);
        });
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
}

module.exports = CanvasViewModel;