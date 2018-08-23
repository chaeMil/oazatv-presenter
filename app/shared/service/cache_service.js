const fs = require('fs-extra');
const FileUtils = require('../util/file_utils');

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
                    callback(CacheService.getCacheLocation() + safeFileName);
                }
            });
        } else {
            callback(CacheService.getCacheLocation() + safeFileName);
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

    static _getUserHome() {
        return process.env.HOME || process.env.USERPROFILE;
    }

    _generateSafeFileName(input) {
        return input.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    }

}

module.exports = CacheService;