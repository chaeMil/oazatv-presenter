const net = require('net');
const ip = require('ip');
const JsonSocket = require('json-socket');

class Server {
    constructor(port) {
        this.port = port;
        this.ipAddress = ip.address();
        this.clients = [];
        this.server = net.createServer();

        this.server.on('connection', function(socket) {
            socket = new JsonSocket(socket); //Now we've decorated the net.Socket to be a JsonSocket
            socket.on('message', message => {
                console.log(message);
                switch (message.action) {
                    case 'CLIENT_CONNECT':
                        this._onNewClientConnection(message);
                        break;
                }
            });
        });
    }

    broadcast(from, message) {
        this.clients.forEach(function (socket, index, array) {
            if (socket === from) return;
            socket.write(JSON.stringify(message));
        });
    };

    run() {
        this.server.listen(this.port, this.ipAddress);
        console.log("Server running on " + this.ipAddress + ":" + this.port);
    }

    _onNewClientConnection(message) {
        let hashClientId = message.hashClientId;
    }
}

module.exports = Server;