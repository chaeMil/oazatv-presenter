const net = require('net');
const ip = require('ip');
const JsonSocket = require('json-socket');

class Server {
    constructor(port) {
        this.port = port;
        this.ipAddress = ip.address();
        this.clients = [];
        this.server = net.createServer();

        this.server.on('connection', socket => {
            socket = new JsonSocket(socket); //Now we've decorated the net.Socket to be a JsonSocket
            socket.on('message', message => {
                if (message.action == 'CLIENT_CONNECT') {
                    this._onNewClientConnection(message);
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
        console.log(message);
        if (!this.clients.hasOwnProperty(hashClientId)) {
            this.clients[hashClientId] = message;
            console.log('Client ' + hashClientId + '@' + message.host + ':' + message.port + ' connected!')
        } else {
            console.error('Client ' + hashClientId + '@' + message.host + ':' + message.port + ' already connected!');
        }
    }

    getConnectedClients() {
        return this.clients;
    }
}

module.exports = Server;