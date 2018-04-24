const net = require('net');
const ip = require('ip');
const JsonSocket = require('json-socket');

class Server {
    constructor(port) {
        this.port = port;
        this.ipAddress = ip.address();
        this.clients = {};
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

    broadcast(message) {
        Object.keys(this.clients).forEach(clientHashId => {
            let client = this.clients[clientHashId];
            let socket = client.socket;
            socket.sendMessage(message);
        });
    };

    run() {
        this.server.listen(this.port, this.ipAddress);
        console.log("Server running on " + this.ipAddress + ":" + this.port);
    }

    _onNewClientConnection(message) {
        let hashClientId = message.hashClientId;
        let client = message;
        let socket =  new JsonSocket(new net.Socket());
        socket.connect(client.port, client.host);
        client.socket = socket;
        if (!this.clients.hasOwnProperty(hashClientId)) {
            this.clients[hashClientId] = client;
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