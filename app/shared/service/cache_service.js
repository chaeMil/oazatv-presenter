const fs = require('fs-extra');
const FileUtils = require('../util/file_utils');
const ip = require('ip');
const os = require('os');
const {app} = require('electron');
const Config = require('../config.js');

class CacheService {

    constructor() {

    }

    init() {
        if (!fs.existsSync(CacheService.getCacheLocation())) {
            FileUtils.mkDirByPathSync(CacheService.getCacheLocation());
        }
    }

    addFileToCache(sourceFile, callback) {
        let safeFileName = this._generateSafeFileName(sourceFile);
        if (this._shouldCacheFile(sourceFile)) {
            fs.copy(sourceFile, CacheService.getCacheLocation() + safeFileName, (err) => {
                if (err) {
                    return console.error(err);
                } else {
                    callback(CacheService.getWebServerCacheLocation() + safeFileName);
                }
            });
        } else {
            callback(CacheService.getWebServerCacheLocation() + safeFileName);
        }
    }

    _shouldCacheFile(sourceFile) {
        let safeFileName = this._generateSafeFileName(sourceFile);
        if (fs.existsSync(CacheService.getCacheLocation() + safeFileName)) {
            let sourceFileStats = fs.statSync(sourceFile);
            let cachedFileStats = fs.statSync(CacheService.getCacheLocation() + safeFileName);
            return (sourceFileStats.mtimeMs != cachedFileStats.mtimeMs);
        } else {
            return true;
        }
    }

    static returnCachedFileContent(cachedFilename, callback) {
        fs.readFile(this.getCacheLocation() + cachedFilename, (err, contents) => {
            callback(contents);
        });
    }

    static getCacheLocation() {
        return this._getUserHome() + "/.oh-presenter/cache/files/";
    }

    static getWebServerCacheLocation() {
        return "http://" + ip.address() + ":" + Config.cacheServerPort + "/files/";
    }

    static _getUserHome() {
        switch (os.platform()) {
            case 'linux':
            case 'darwin':
                return process.env.HOME;
            case 'win32':
                return app.getPath('appData');
            default:
                return process.env.HOME;
        }
    }

    _generateSafeFileName(input) {
        return input.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    }

}

module.exports = CacheService;