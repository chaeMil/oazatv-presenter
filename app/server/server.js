const electron = require('electron');
const {ipcMain} = electron;

const net = require('net');
const ip = require('ip');
const JsonSocket = require('json-socket');

class Server {
    constructor(port, statusCallback) {
        this.port = port;
        this.ipAddress = ip.address();
        this.clients = {};
        this.server = net.createServer();
        this.statusCallback = statusCallback;

        this.server.on('connection', socket => {
            socket = new JsonSocket(socket);
            socket.on('message', message => {
                if (message.action == 'CLIENT_CONNECT') {
                    this._onNewClientConnection(message);
                } else if (message.action == 'CLIENT_DISCONNECT') {
                    this._onClientDisconnection(message);
                }
            });
        });

        setInterval(() => {
            this._checkForClientConnections();
        }, 5000);
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

    _sendMessageToClient(socket, message, errorCallback) {
        socket.sendMessage(message, (error) => {
            if (error) {
                console.log(error);
                if (errorCallback != null) {
                    errorCallback(error);
                }
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
        this.clients[clientHashId] = client;
        this.statusCallback('server_status', 'get_clients_list', this.getClientsList());
        console.log('Client ' + clientHashId + '@' + message.host + ':' + message.port + ' connected')
    }

    _onClientDisconnection(message) {
        let clientHashId = message.clientHashId;
        if (this.clients.hasOwnProperty(clientHashId)) {
            let client = this.clients[clientHashId];
            let socket = client.socket;
            socket.end();
            this.clients[clientHashId] = undefined;
            this.statusCallback('server_status', 'get_clients_list', this.getClientsList());
            console.log('Client ' + clientHashId + '@' + message.host + ':' + message.port + ' disconnected')
        }
    }

    getClientsList() {
        return this.clients;
    }

    _checkForClientConnections() {
        Object.keys(this.clients).forEach(clientHashId => {
            let client = this.clients[clientHashId];
            if (client != null) {
                //console.log('sending ping to client: ' + client.clientHashId + '@' + client.host + ':' + client.port);
                this._sendMessageToClient(client.socket, {ping: true}, (error) => {
                    console.log('client ' + client.clientHashId + '@' + client.host + ':' + client.port
                        + ' not responsing, ' + error);
                });
            }
        });
    }
}

module.exports = Server;