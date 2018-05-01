let {ipcRenderer, remote, webFrame} = require('electron');
import {fabric} from 'fabric';

let main = remote.require("./main.js");
let $ = require('jquery');
let canvas;

webFrame.setVisualZoomLevelLimits(1, 1);
webFrame.setLayoutZoomLevelLimits(0, 0);

ipcRenderer.on('data', function (event, data) {
    if (data.action == 'bg') {
        canvas.backgroundColor = data.value;
        canvas.renderAll();
    }
});

function addStuffToCanvas() {
    let json = '{"version":"2.2.3","objects":[{"type":"rect","version":"2.2.3","originX":"left","originY":"top","left":100,"top":100,"width":60,"height":70,"fill":"red","stroke":null,"strokeWidth":1,"strokeDashArray":null,"strokeLineCap":"butt","strokeLineJoin":"miter","strokeMiterLimit":10,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"clipTo":null,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","transformMatrix":null,"skewX":0,"skewY":0,"rx":0,"ry":0},{"type":"rect","version":"2.2.3","originX":"left","originY":"top","left":750,"top":550,"width":200,"height":180,"fill":"blue","stroke":null,"strokeWidth":1,"strokeDashArray":null,"strokeLineCap":"butt","strokeLineJoin":"miter","strokeMiterLimit":10,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"clipTo":null,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","transformMatrix":null,"skewX":0,"skewY":0,"rx":0,"ry":0},{"type":"rect","version":"2.2.3","originX":"left","originY":"top","left":250,"top":300,"width":60,"height":120,"fill":"green","stroke":null,"strokeWidth":1,"strokeDashArray":null,"strokeLineCap":"butt","strokeLineJoin":"miter","strokeMiterLimit":10,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"clipTo":null,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","transformMatrix":null,"skewX":0,"skewY":0,"rx":0,"ry":0}]}';

    canvas.loadFromJSON(json, function() {
        canvas.renderAll();
    },function(o,object){
        console.log(o,object)
    })
}

(function () {
    canvas = new fabric.Canvas('canvas');

    window.addEventListener('resize', resizeCanvas, false);

    function resizeCanvas() {
        canvas.setHeight(window.innerHeight);
        canvas.setWidth(window.innerWidth);
        canvas.renderAll();
    }

    // resize on init
    resizeCanvas();
    addStuffToCanvas();
})();