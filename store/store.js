// dossier store est destiné à être utilisé par l'application uniquement

const YAML = require('yamljs');
const jsonFile = require('jsonfile');
const fs = require('fs');

module.exports = {
    getOrderSpecs: function(orderId) {
        try {
            const spec = YAML.load(`./store/orders/_specs/order-${orderId}.yml`);
            return spec;
        } catch(e) {
            throw new Error(`Order ${orderId} specification file doesn't exist`);
        }

    },
    /*deleteOrderSpecs: function(orderId) {
        const spec = YAML.load(`./store/orders/_specs/order-${orderId}.yml`);
        return spec;
    },*/
    persistOrder: function(order) {
        let path = this.createOrderDirectory(order);
        return jsonFile.writeFileSync(`${path}/order-meta.json`, order._meta, {spaces: 2});
    },
    recoverOrder: function(order) {
        let path = this.getOrderDirectoryPath(order);
        return jsonFile.readFileSync(`${path}/order-meta.json`);
    },
    createOrderDirectory: function(order) {
        let path = this.getOrderDirectoryPath(order);
        if (!fs.existsSync(path)){
            fs.mkdirSync(path);
        }

        return path;
    },
    getOrderDirectoryPath: function(order) {
        return __dirname + `/orders/order-${order.getId()}`
    }
};
