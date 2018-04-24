class ConnectionMessage {

    constructor(host, port, hashClientId, clientDisplayName) {
        this.action = 'CLIENT_CONNECT';
        this.host = host;
        this.port = port;
        this.hashClientId = hashClientId;
        this.clientDisplayName = clientDisplayName;
    }
}

module.exports = ConnectionMessage;