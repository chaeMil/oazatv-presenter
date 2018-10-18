const StringUtils = require('../../util/string_utils');

class DataItem {
    constructor(name, value) {
        this.id = StringUtils.makeId();
        this.name = name;
        this.value = value;
    }
}

module.exports = DataItem;