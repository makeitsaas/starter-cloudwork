const jsonFile = require('jsonfile');
const storageDir = './store/environments';

function Environment(id) {
    this._meta = {
        id
    };
    this.load();
}

Environment.prototype = {
    load: function () {
        // load stored value if existing
        try {
            this._meta = this.recover();
        } catch(e) {
            // no saved configuration
            this.persist();
        }
    },
    getId: function () {
        return this.getValue('id');
    },
    getValue: function (key) {
        return this._meta[key];
    },
    setValue: function (key, value) {
        this._meta[key] = value;
        this.persist();
    },
    persist: function() {
        return jsonFile.writeFileSync(`${storageDir}/${this._meta.id}.json`, this._meta, {spaces: 2});
    },
    recover: function() {
        return jsonFile.readFileSync(`${storageDir}/${this._meta.id}.json`);
    }
};

module.exports = Environment;
