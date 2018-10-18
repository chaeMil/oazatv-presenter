const StringUtils = require('../../util/string_utils');

class DataSet {
    constructor(name, data) {
        this.id = StringUtils.makeId();
        this.name = name;
        this.data = data;
    }
}

module.exports = DataSet;