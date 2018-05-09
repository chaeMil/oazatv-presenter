import BaseViewModel from './base_viewmodel';

let fabric = require('fabric').fabric;

class CanvasDesignerViewModel extends BaseViewModel {

    constructor(ko, ipcMain) {
        super(ko, ipcMain);
        this.textEditorValues = {
            fontFamily: ko.observable(""),
            color: ko.observable("")
        };
        this.objectEditorValues = {
            scaleX: ko.observable(""),
            scaleY: ko.observable("")
        }
    }

    init() {
        super.init();
        this._getUiElements();
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

    _changeSelectedObjectAttribute(attributeName, value) {
        if (this.selectedObject != null) {
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
        console.log("onTextSelected", this.selectedObject);
        this.textEditorValues.fontFamily(this.selectedObject.fontFamily);
        this.textEditorValues.color(this.selectedObject.color);

        this.textEditorValues.fontFamily.subscribe((newValue) => {
            this._changeSelectedObjectAttribute('fontFamily', newValue);
        });
        this.textEditorValues.color.subscribe((newValue) => {
            this._changeSelectedObjectAttribute('color', newValue);
        });
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
            }
        } else {
            this._onSelectionCleared(event)
        }
    }

    _onSelectionCleared(event) {
        this.selectedObject = null;
        this.objectEditor.classList.add("hidden");
        this.textEditor.classList.add("hidden");
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
            uniScaleTransform: true
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
        this.canvas.setHeight(this.canvasWrapper.offsetHeight);
        this.canvas.setWidth(this.canvasWrapper.offsetWidth);
        this.canvas.renderAll();
    }

    _getUiElements() {
        this.textEditor = document.querySelector('#text-editor');
        this.objectEditor = document.querySelector("#object-editor");
    }
}

module.exports = CanvasDesignerViewModel;