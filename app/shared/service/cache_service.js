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

    addFileToCache(sourceFile) {
        let safeFileName = this._generateSafeFileName(sourceFile);
        fs.copy(sourceFile, this._getCacheLocation() + safeFileName, (err) => {
            if (err) return console.error(err);
            console.log('success!')
        })
    }

    _shouldCacheTheFile(sourceFile) {
        let safeFileName = this._generateSafeFileName(sourceFile);
        fs.exists(safeFileName, (exists) => {

        });

        let sourceFileStats = fs.statSync(sourceFile);
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