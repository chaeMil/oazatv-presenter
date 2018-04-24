const net = require('net');
const ip = require('ip');
const JsonSocket = require('json-socket');
const StringUtils = require('../shared/util/string_utils');
const ConnnectionMessage = require('../shared/model/connection_actions/connection_message');

class Client {
    constructor(port, onDataReceivedCallback, connectionRetries, delayBetweenRetriesInSeconds, autoReconnect, displayName) {
        this.port = port;
        this.connectionRetries = connectionRetries;
        this.retries = connectionRetries;
        this.retriesDelay = delayBetweenRetriesInSeconds * 1000;
        this.ipAddress = ip.address();
        this.connected = false;
        this.client = new JsonSocket(new net.Socket());
        this.server = null;
        this.autoReconnect = autoReconnect;
        this.onDataReceivedCallback = onDataReceivedCallback;
        this.clientHashId = StringUtils.makeId();
        this.displayName = displayName;
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
        let LAN = this.ipAddress.substr(0, this.ipAddress.lastIndexOf("."));
        for (let i = 1; i <= 255; i++) {
            console.log("checking " + LAN + '.' + i + ":" + this.port);
            this._checkPort(this.port, LAN + '.' + i, function (error, status, host, port) {
                if (status == "open") {
                    console.log("Server found: ", host, port, status);
                    onServerFound(host, port);
                    return;
                }
            });
        }
    }

    _onConnected(host, port, onDataReceivedCallback) {
        this.connected = true;
        this.server = new JsonSocket(new net.Socket());
        this.server.connect(port, host);

        this.client.connect(port, host, () => {
            console.log("Server found on " + host + ":" + port + ", connecting!");
            let connectionMessage = new ConnnectionMessage(this.ipAddress, this.port, this.clientHashId, this.displayName);
            this._sendMessageToServer(connectionMessage);
        });

        this.client.on('data', function (data) {
            let content = String.fromCharCode.apply(null, data);
            console.log("Received: " + content);
            onDataReceivedCallback(content);
        });

        this.client.on('close', () => {
            console.log('Connection closed');
            this.connected = false;
            if (this.autoReconnect) {
                console.log("Trying to reconnect");
                this.retries = this.connectionRetries;
                this._connect(this.onDataReceivedCallback);
            }
        });
    }

    _connect(onDataReceivedCallback) {
        setInterval(() => {
            if (!this.connected && (this.connectionRetries == 0 || this.retries > 0)) {
                this._scanForServerInLocalNetwork(
                    (host, port) => {
                        this._onConnected(host, port, onDataReceivedCallback);
                    }
                )
            } else if (this.retries == 0 && !this.connected) {
                console.log("Server not found");
            }
            this.retries--;
        }, this.retriesDelay)
    }

    _sendMessageToServer(message) {
        if (this.server != null) {
            this.server.sendMessage(message);
        } else {
            console.error('server is null!')
        }
    }

    create() {
        this._connect(this.onDataReceivedCallback);
    }
}

module.exports = Client;