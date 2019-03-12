const jsonFile = require('jsonfile');
const servers = require('./servers');

const secret = process.env.VAULT_SECRET ? process.env.VAULT_SECRET : 'undefined';
const cryptoJSON = require('crypto-json');

module.exports = {
    getVault: function(environment, service) {
        const vaultExists = false;
        let vault, code = this.getCode(environment, service);
        if(!vaultExists) {
            vault = this.generateVault(code);
            this.persist(code, vault);
        } else {
            this.recover(code);
        }

        return vault;
    },
    generateVault: function(code) {
        return {
            //cryptKey: `${secret.slice(0, 4)}**************`,
            hostname: servers.getAvailableDbHost(),
            database: `auto_db_${code}`,
            username: `auto_user_${code}`,
            password: `password`,
        };
    },
    getCode: function(environment, service) {
        return `e${environment.id}_s${service.id}`;
    },
    persist: function(code, vault) {
        let encrypted = cryptoJSON.encrypt(vault, secret);
        return jsonFile.writeFileSync(`./store/vaults/vault-${code}.secret`, encrypted, {spaces: 2});
    },
    recover: function(code) {
        let encrypted = jsonFile.readFileSync(`./store/vaults/vault-${code}.secret`);
        return cryptoJSON.decrypt(encrypted, secret);
    }
};