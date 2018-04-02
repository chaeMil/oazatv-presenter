const net = require('net');
const ip = require('ip');

class Client {
    constructor(port, connectionRetries, delayBetweenRetriesInSeconds, autoReconnect) {
        this.port = port;
        this.connectionRetries = connectionRetries;
        this.retries = connectionRetries;
        this.retriesDelay = delayBetweenRetriesInSeconds * 1000;
        this.ipAddress = ip.address();
        this.connected = false;
        this.client = new net.Socket();
        this.autoReconnect = autoReconnect;
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

    _onConnected(host, port) {
        this.connected = true;

        this.client.connect(port, host, function () {
            console.log("Server found on " + host + ":" + port + ", connecting!");
        });

        this.client.on('data', function (data) {
            let content = String.fromCharCode.apply(null, data);
            console.log("Received: " + content);
        });

        this.client.on('close', function () {
            console.log('Connection closed');
            this.connected = false;
            if (this.autoReconnect) {
                this.retries = this.connectionRetries;
                this._connect();
            }
        });
    }

    _connect() {
        setInterval(() => {
            if (!this.connected && this.retries > 0) {
                this._scanForServerInLocalNetwork(
                    (host, port) => {
                        this._onConnected(host, port);
                    }
                )
            } else if (this.retries == 0 && !this.connected) {
                console.log("Server not found");
            }
            this.retries--;
        }, this.retriesDelay)
    }

    create() {
        this._connect();
    }
}

module.exports = Client;