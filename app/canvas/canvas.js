const config = require('../shared/config');
const Client = require('./client');
let client = new Client(config.port, 5, 3);
client.create();