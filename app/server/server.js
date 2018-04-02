const net = require('net');
const ip = require('ip');

class Server {
    constructor(port) {
        this.port = port;
        this.ipAddress = ip.address();
        this.clients = [];
        this.clientId = 0;

        this.server = net.createServer(socket => {
            this.clientId++;
            this.clients.push(socket);
            console.log('Client #' + this.clientId + ' joined server');
            socket.pipe(socket);
            socket.on("error", (err) => {
                console.error(err);
            });

            this.broadcast(socket, this.clientId + ' joined server.\n');
        });
    }

    broadcast(from, message) {
        this.clients.forEach(function (socket, index, array) {
            if (socket === from) return;
            socket.write(message);
        });
    };

    run() {
        this.server.listen(this.port, this.ipAddress);
        console.log("Server running on " + this.ipAddress + ":" + this.port);
    }
}

module.exports = Server;