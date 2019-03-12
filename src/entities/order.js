const store = require('../../store/store');

function Order(id) {
    // procedure=create/update/delete, envConfig={domains, envId, services}
    this._meta = {
        id,
        status: 'to-load'
    };  // status,
}

Order.prototype = {
    load: function () {
        // load stored value if existing
        this._meta = store.recoverOrder(this);
    },
    loadSpecs: function () {
        const specs = store.getOrderSpecs(this._meta.id);
        this.set('specs', specs);
        this.set('status', 'in-progress');
    },
    hasSpecs: function () {
        // returns true if specs file exists
        try {
            const specs = store.getOrderSpecs(this._meta.id);
            return !!specs;
        } catch (e) {
            return false;
        }
    },
    getDirectory: function() {
        return store.getOrderDirectoryPath(this);
    },
    getId: function () {
        return this.get('id');
    },
    get: function (key) {
        return this._meta[key];
    },
    set: function (key, value) {
        this._meta[key] = value;
        store.persistOrder(this);
    }
};

module.exports = Order;
