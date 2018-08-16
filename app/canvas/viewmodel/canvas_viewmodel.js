import BaseViewModel from '../../shared/viewmodel/base_viewmodel';

let fabric = require('fabric').fabric;
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

    _initMessaging() {
        this.ipcRenderer.on('data', (event, data) => {
            switch (data.action) {
                case 'bg':
                    this.canvas.backgroundColor = data.value;
                    this.canvas.renderAll();
                    break;
                case 'canvas_json':
                    let canvasJson = JSON.parse(data.value);
                    this.canvas.loadFromJSON(canvasJson, () => {
                        this.canvas.renderAll();
                    }, (o, object) => {
                        console.log(o, object)
                    });
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
}

module.exports = CanvasViewModel;