import BaseViewModel from './base_viewmodel';

let fabric = require('fabric').fabric;

class CanvasDesignerViewModel extends BaseViewModel {

    init() {
        super.init();
        this._initCanvas();
    }

    addRectangle() {
        let rectangle = new fabric.Rect({
            left: 15,
            top: 15,
            fill: '',
            width: 100,
            height: 100,
            stroke: 'red',
            strokeWidth: 3,
        });
        rectangle.set('selectable', true);
        this.canvas.add(rectangle);
    }

    addText() {
        let newID = (new Date()).getTime().toString().substr(5);
        let text = new fabric.IText('text', {
            fontFamily: 'arial black',
            left: 100,
            top: 100,
            myid: newID
        });
        text.set('selectable', true);
        this.canvas.add(text);
    }

    _initCanvas() {
        this.canvas = new fabric.Canvas('canvas', {
            selection: true,
            uniScaleTransform: true
        });
        window.addEventListener('resize', () => {
            this._resizeCanvas();
        }, false);
        this._resizeCanvas();
        this.addText();
    }

    _resizeCanvas() {
        let windowContent = document.querySelector('body');
        this.canvas.setHeight(windowContent.offsetHeight);
        this.canvas.setWidth(windowContent.offsetWidth);
        this.canvas.renderAll();
    }
}

module.exports = CanvasDesignerViewModel;