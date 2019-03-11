const store = require('../store/store');

function Environment(id) {
    this._meta = {
        id
    };
}

Environment.prototype = {
    load: function () {
        // load stored value if existing
        this._meta = store.recoverOrder(this);
    },
    getId: function () {
        return this.getValue('id');
    },
    getValue: function (key) {
        return this._meta[key];
    },
    setValue: function (key, value) {
        this._meta[key] = value;
        store.persistOrder(this);
    }
};

module.exports = Environment;
