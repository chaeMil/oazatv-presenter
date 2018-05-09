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
            top: 100,
        });
        text.set('selectable', true);
        this.canvas.add(text);
    }

    broadcastToCanvas() {
        let jsonData = this.canvas.toJSON();
        this.ipcRenderer.send('broadcast', {action: 'canvas_json', value: JSON.stringify(jsonData)});
    }

    _onTextSelected() {

    }

    _onRectangleSelected() {

    }

    _onCircleSelected() {

    }

    _onSelection(event) {
        if (event.selected && event.selected.length == 1) {
            this.selectedObject = event.target;
            console.log("onSelection", this.selectedObject);

            if (this.selectedObject.isType('text')) {
                this._onTextSelected();
            } else if (this.selectedObject.isType('rect')) {
                this._onRectangleSelected();
            } else if (this.selectedObject.isType('circle')) {
                this._onCircleSelected();
            }
        } else {
            this._onSelectionCleared(event)
        }
    }

    _onSelectionCleared(event) {
        this.selectedObject = null;
    }

    _initCanvas() {
        this.canvasWrapper = document.querySelector('#canvas-wrapper');
        this.canvas = new fabric.Canvas('canvas', {
            selection: true,
            uniScaleTransform: true
        });

        this.canvas.on('selection:created', (event) => {
            this._onSelection(event);
        });
        this.canvas.on('selection:updated', (event) => {
            this._onSelection(event);
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
        this.canvas.setHeight(this.canvasWrapper.offsetHeight);
        this.canvas.setWidth(this.canvasWrapper.offsetWidth);
        this.canvas.renderAll();
    }
}

module.exports = CanvasDesignerViewModel;