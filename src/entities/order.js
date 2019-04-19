const store = require('../../store/store');
const fs = require('fs');
const jsonFile = require('jsonfile');
const YAML = require('yamljs');
const {Service} = require('./service');   // shall be service spec instead

const ORDER_STATUSES = {
    'recovering': 'recovering',
    'ready': 'ready',
    'processing': 'processing',
    'success': 'success',
    'error': 'error',
};

function Order(id) {
    this.id = id;
    this.status= ORDER_STATUSES.recovering;
    this.specs = {
        environmentId: undefined,
        domains: [],
        services: []
    };
    this.load();
}

Order.prototype = {
    load: function () {
        // load stored value if existing
        try {
            let stored = this._recover();
            for(let key in stored) {
                this[key] = stored[key];
            }
        } catch(e) {
            // and if not exists, init from specs
            this.specs = this.readSpecs();
            this.status = ORDER_STATUSES.ready;
            this._persist();
        }
    },
    readSpecs: function() {
        try {
            return YAML.load(`./store/orders/_specs/order-${this.id}.yml`);
        } catch(e) {
            throw new Error(`Order ${this.id} specification file doesn't exist`);
        }
    },
    exportSpecs: function() {
        let action = this.specs.action,
            environmentId = this.specs.environment_id,
            services = this.specs.services.map(s => new Service(s)),
            domains = this.specs.domains;

        return {action, environmentId, services, domains};
    },
    getAbsoluteDirectory: function() {
        return store.getStoreDirectory() + `/orders/order-${this.id}`;
    },
    _onSuccess: function() {
        this.status = ORDER_STATUSES.success;
        this._persist();
    },
    _onError: function(e) {
        this.status = ORDER_STATUSES.error;
        this.error = e;
        this._persist();
    },
    _persist: function() {
        this._createOrderDirectory();
        return jsonFile.writeFileSync(`${this.getAbsoluteDirectory()}/order.json`, this, {spaces: 2});
    },
    _recover: function() {
        return jsonFile.readFileSync(`${this.getAbsoluteDirectory()}/order.json`);
    },
    _createOrderDirectory: function() {
        let path = this.getAbsoluteDirectory();
        if (!fs.existsSync(path)){
            fs.mkdirSync(path);
        }

        return path;
    },
};

module.exports = {Order, ORDER_STATUSES};
