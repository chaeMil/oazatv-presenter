const fs = require('fs-extra');

let openCanvasFile = process.env.HOME + '/.oh-presenter/SHOULD_OPEN_CANVAS';
openCanvas = fs.existsSync(openCanvasFile);

if (openCanvas) {
    require('./canvas/main.js');
} else {
    require('./server/main.js');
}