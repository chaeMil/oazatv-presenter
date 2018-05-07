let {ipcRenderer, remote, webFrame} = require('electron');
let fabric = require('fabric').fabric;

let main = remote.require("./main.js");
let $ = require('jquery');
let canvas;

webFrame.setVisualZoomLevelLimits(1, 1);
webFrame.setLayoutZoomLevelLimits(0, 0);

ipcRenderer.on('data', function (event, data) {
    switch (data.action) {
        case 'bg':
            canvas.backgroundColor = data.value;
            canvas.renderAll();
            break;
        case 'canvas_json':
            let canvasJson = JSON.parse(data.value);
            canvas.loadFromJSON(canvasJson, function () {
                canvas.renderAll();
            }, function (o, object) {
                console.log(o, object)
            });
            break;
    }
});

ipcRenderer.on('connection', function (event, value) {
    if (value) {
        $('#connection-status').addClass('connected');
    } else {
        $('#connection-status').removeClass('connected');
    }
});

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
})();