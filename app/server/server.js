const net = require('net');
let clients = [];
let clientId = 0;

const server = net.createServer(function (socket) {
    clientId++;
    clients.push(socket);
    console.log('Client #' + clientId + ' joined server');
    socket.pipe(socket);
    broadcast(socket, clientId + ' joined server.\n')
});

server.listen(1337, '127.0.0.1');

// Broadcast to others, excluding the sender
function broadcast(from, message) {
    clients.forEach(function (socket, index, array) {
        if (socket === from) return;
        socket.write(message);
    });
}