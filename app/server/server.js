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
                } else if (message.action == 'CLIENT_DISCONNECT') {
                    this._onClientDisconnection(message);
                }
            });
        });
    }

    broadcast(message, clientHashIdFilter) {
        if (clientHashIdFilter != null) {
            let client = this.clients[clientHashIdFilter];
            if (client != null) {
                let socket = client.socket;
                if (socket != null) {
                    this._sendMessageToClient(socket, message);
                }
            }
        } else {
            Object.keys(this.clients).forEach(clientHashId => {
                let client = this.clients[clientHashId];
                if (client != null) {
                    let socket = client.socket;
                    if (socket != null) {
                        this._sendMessageToClient(socket, message);
                    }
                }
            });
        }
    };

    _sendMessageToClient(socket, message) {
        socket.sendMessage(message, (error) => {
            if (error) {
                console.log(error);
            }
        });
    }

    run() {
        this.server.listen(this.port, this.ipAddress);
        console.log("Server running on " + this.ipAddress + ":" + this.port);
    }

    _onNewClientConnection(message) {
        let clientHashId = message.clientHashId;
        let client = message;
        let socket = new JsonSocket(new net.Socket());
        socket.connect(client.port, client.host);
        client.socket = socket;
        if (!this.clients.hasOwnProperty(clientHashId)) {
            this.clients[clientHashId] = client;
            console.log('Client ' + clientHashId + '@' + message.host + ':' + message.port + ' connected')
        } else {
            console.error('Client ' + clientHashId + '@' + message.host + ':' + message.port + ' already connected!');
        }
    }

    _onClientDisconnection(message) {
        let clientHashId = message.clientHashId;
        if (this.clients.hasOwnProperty(clientHashId)) {
            let client = this.clients[clientHashId];
            let socket = client.socket;
            socket.end();
            this.clients[clientHashId] = undefined;
            console.log('Client ' + clientHashId + '@' + message.host + ':' + message.port + ' disconnected')
        }
    }
}

module.exports = Server;