const net = require('net');
const ip = require('ip');
const JsonSocket = require('json-socket');
const StringUtils = require('../shared/util/string_utils');
const ConnectionMessage = require('../shared/model/connection_actions/connection_message');
const DisconnectionMessage = require('../shared/model/connection_actions/disconnection_message');

class Client {
    constructor(port, serverPort, onDataReceivedCallback, onConnectionChangedCallback,
                connectionRetries, delayBetweenRetriesInSeconds, autoReconnect, displayName) {
        this.port = port;
        this.serverPort = serverPort;
        this.connectionRetries = connectionRetries;
        this.retries = connectionRetries;
        this.retriesDelay = delayBetweenRetriesInSeconds * 1000;
        this.ipAddress = ip.address();
        this.connected = false;
        this.client = null;
        this.server = null;
        this.autoReconnect = autoReconnect;
        this.onDataReceivedCallback = onDataReceivedCallback;
        this.onConnectionChangedCallback = onConnectionChangedCallback;
        this.clientHashId = StringUtils.makeId();
        this.displayName = displayName;

        process.on('uncaughtException', (err) => {
            this.connected = false;
            this.client.close();
            if (err.code == 'EADDRINUSE') {
                console.warn('Port ' + this.port + ' already used! Increasing port number by 1 and trying again');
                this.port += 1;
                this._onConnected(this.serverAddress, this.serverPort, this.onDataReceivedCallback);
            } else {
                console.error(err);
            }
        });
    }

    _checkPort(port, host, callback) {
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

    _scanForServerInLocalNetwork(onServerFound) {
        if (!this.connected) {
            let LAN = this.ipAddress.substr(0, this.ipAddress.lastIndexOf("."));
            for (let i = 1; i <= 255; i++) {
                console.log("checking " + LAN + '.' + i + ":" + this.serverPort);
                this._checkPort(this.serverPort, LAN + '.' + i, function (error, status, host, port) {
                    if (status == "open") {
                        console.log("Server found: ", host, port, status);
                        onServerFound(host, port);
                        return;
                    }
                });
            }
        }
    }

    _onConnected(host, port, onDataReceivedCallback) {
        this.serverPort = port;
        this.serverAddress = host;

        this.server = new JsonSocket(new net.Socket());
        this.server.connect(port, host);
        this.server.on('connect', () => {
            let connectionMessage = new ConnectionMessage(this.ipAddress, this.port, this.clientHashId, this.displayName);
            this._sendMessageToServer(connectionMessage);
        });

        this.client = net.createServer();
        this.client.listen(this.port);
        this.client.on('connection', (socket) => {
            this.connected = true;
            this.onConnectionChangedCallback(this.connected);

            socket = new JsonSocket(socket);
            socket.on('message', (message) => {
                onDataReceivedCallback(message);
            });
            setInterval(() => {
                this.onConnectionChangedCallback(this.connected);
                if (this.connected) {
                    this._checkIfServerIsAlive();
                }
            }, 5000);
        });
    }

    _connect(onDataReceivedCallback) {
        setInterval(() => {
            if (!this.connected && (this.connectionRetries == 0 || this.retries > 0)) {
                this._scanForServerInLocalNetwork((host, port) => {
                        this._onConnected(host, port, onDataReceivedCallback);
                    }
                )
            } else if (this.retries == 0 && !this.connected) {
                console.log("Server not found");
            }
            this.retries--;
        }, this.retriesDelay)
    }

    disconnect(callback) {
        if (this.server != null) {
            let disconnectionMessage = new DisconnectionMessage(this.ipAddress, this.port, this.clientHashId, this.displayName);
            this.server.sendMessage(disconnectionMessage, (error) => {
                if (error) {
                    console.log('Cannot disconnect from server: ' + error);
                } else {
                    console.log('Client disconnected');
                    this.connected = false;
                }
                this.onConnectionChangedCallback(this.connected);
                callback();
            });
        }
    }

    _sendMessageToServer(message, callback) {
        if (this.server != null) {
            this.server.sendMessage(message, callback);
        } else {
            console.error('server is null!')
        }
    }

    _checkIfServerIsAlive() {
        this._sendMessageToServer({}, (error) => {
            if (error) { // server is probably not running
                this.connected = false;
                console.log('Disconnected from server, trying to reconnect');
                this._connect(this.onDataReceivedCallback);
            }
        });
    }

    create() {
        this._connect(this.onDataReceivedCallback);
    }
}

module.exports = Client;