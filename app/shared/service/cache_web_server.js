const http = require('http');
const Router = require('node-simple-router');
const CacheService = require('./cache_service.js');
const Config = require('../config');

class CacheWebServer {
    constructor() {
        this.router = new Router();
        this.server = http.createServer(this.router);
        this.cacheLocation = CacheService.getCacheLocation();
    }

    init() {
        this._setupRoutes();
        this.server.listen(Config.cacheServerPort);
    }

    _setupRoutes() {
        this.router.get("/files/:cached_filename", (request, response) => {
            CacheService.returnCachedFileContent(request.params.cached_filename, (contents) => {
                response.writeHead(200, {'Content-type': 'image/jpeg'});
                response.write(contents);
                response.end();
            });
        });
    }
}

module.exports = CacheWebServer;