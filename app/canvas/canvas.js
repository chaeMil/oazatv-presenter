const net = require('net');
const client = new net.Socket();

let checkPort = function (port, host, callback) {
    let socket = new net.Socket(), status = null;

    // Socket connection established, port is open
    socket.on('connect', function () {
        status = 'open';
        socket.end();
    });
    socket.setTimeout(1500);// If no response, assume port is not listening
    socket.on('timeout', function () {
        status = 'closed';
        socket.destroy();
    });
    socket.on('error', function (exception) {
        status = 'closed';
    });
    socket.on('close', function (exception) {
        callback(null, status, host, port);
    });

    socket.connect(port, host);
};

let LAN = '192.168.0';
let port = 1337;

//scan over a range of IP addresses and execute a function each time the LLRP port is shown to be open.
for (let i = 1; i <= 255; i++) {
    console.log("checking " + LAN + '.' + i + ":" + port);
    checkPort(port, LAN + '.' + i, function (error, status, host, port) {
        if (status == "open") {
            console.log("Reader found: ", host, port, status);
        }
    });
}

/*client.connect(1337, '127.0.0.1', function () {
    console.log('Connected');
});

client.on('data', function (data) {
    let content = String.fromCharCode.apply(null, data);
    console.log("Received: " + content);
});

client.on('close', function () {
    console.log('Connection closed');
});*/