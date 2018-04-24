class ConnectionMessage {

    constructor(host, port, clientHashId, clientDisplayName) {
        this.action = 'CLIENT_CONNECT';
        this.host = host;
        this.port = port;
        this.clientHashId = clientHashId;
        this.clientDisplayName = clientDisplayName;
    }
}

module.exports = ConnectionMessage;