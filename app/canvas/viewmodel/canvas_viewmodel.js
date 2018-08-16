import BaseViewModel from '../../shared/viewmodel/base_viewmodel';

let fabric = require('fabric').fabric;
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
            uniScaleTransform: true
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
        canvasJson.objects.forEach((item) => {
            if (item.type === "video") {
                this._addVideo(item);
            }
        });
    }

    _initMessaging() {
        this.ipcRenderer.on('data', (event, data) => {
            switch (data.action) {
                case 'bg':
                    this.canvas.backgroundColor = data.value;
                    this.canvas.renderAll();
                    break;
                case 'canvas_json':
                    let canvasJson = JSON.parse(data.value);
                    console.log(canvasJson);
                    this._removeVideoElements();
                    this.canvas.loadFromJSON(canvasJson, () => {
                        this.canvas.renderAll();
                    }, (o, object) => {
                        //console.log(o, object)
                    });
                    this._processVideoElements(canvasJson);
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

    _addVideo(object) {
        let self = this;
        let videoElement = document.createElement('video');
        videoElement.id = object.videoId;
        videoElement.src = object.src;
        videoElement.autoplay = true;
        videoElement.currentTime = object.videoTime;
        videoElement.setAttribute("style", "pointer-events: none; width: 1920px; height: 1080px; position: absolute; top: 1080px; left: 0px");
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

        self.canvas.add(video);
        fabric.util.requestAnimFrame(function render() {
            self.canvas.renderAll();
            fabric.util.requestAnimFrame(render);
        });
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