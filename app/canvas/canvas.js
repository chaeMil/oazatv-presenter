const net = require('net');
const client = new net.Socket();

client.connect(1337, '127.0.0.1', function () {
    console.log('Connected');
});

client.on('data', function (data) {
    let content = String.fromCharCode.apply(null, data);
    console.log("Received: " + content);
});

client.on('close', function () {
    console.log('Connection closed');
});