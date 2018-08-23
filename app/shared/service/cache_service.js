const fs = require('fs-extra');
const FileUtils = require('../util/file_utils');

class CacheService {

    constructor() {

    }

    init() {
        if (!fs.existsSync(this._getCacheLocation())) {
            FileUtils.mkDirByPathSync(this._getCacheLocation());
        }
    }

    addFileToCache(sourceFile, callback) {
        let safeFileName = this._generateSafeFileName(sourceFile);
        if (this._shouldCacheTheFile(sourceFile)) {
            fs.copy(sourceFile, this._getCacheLocation() + safeFileName, (err) => {
                if (err) {
                    return console.error(err);
                } else {
                    callback(this._getCacheLocation() + safeFileName);
                    console.log("caching file: " + safeFileName);
                }
            });
        } else {
            callback(this._getCacheLocation() + safeFileName);
            console.log("file already cached, returning: " + safeFileName);
        }
    }

    _shouldCacheTheFile(sourceFile) {
        let safeFileName = this._generateSafeFileName(sourceFile);
        if (fs.existsSync(this._getCacheLocation() + safeFileName)) {
            let sourceFileStats = fs.statSync(sourceFile);
            let cachedFileStats = fs.statSync(this._getCacheLocation() + safeFileName);
            return (sourceFileStats.mtimeMs != cachedFileStats.mtimeMs);
        } else {
            return true;
        }
    }

    _getCacheLocation() {
        return this._getUserHome() + "/.oh-presenter/cache/files/";
    }

    _getUserHome() {
        return process.env.HOME || process.env.USERPROFILE;
    }

    _generateSafeFileName(input) {
        return input.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    }

}

module.exports = CacheService;