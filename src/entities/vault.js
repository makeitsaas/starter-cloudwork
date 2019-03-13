const jsonFile = require('jsonfile');
const servers = require('./servers');
const YAML = require('yamljs');

const secret = process.env.VAULT_SECRET ? process.env.VAULT_SECRET : 'undefined';
const cryptoJSON = require('crypto-json');

function Vault(code) {
    this.code = code;
    this.repo_url = undefined;
    this.repo_directory = undefined;
    this.service_port = undefined;
    this.db_hostname = undefined;
    this.db_database = undefined;
    this.db_username = undefined;
    this.db_password = undefined;
    this._init();
}

Vault.prototype = {
    _init() {
        try {
            let persisted = this._recover();
            for(let key in persisted) {
                this[key] = persisted[key];
            }
        } catch(e) {
            //does not exist yet, nothing to do
        }
    },
    _persist: function() {
        let encrypted = cryptoJSON.encrypt(this, secret);
        return jsonFile.writeFileSync(`./store/vaults/vault-${this.code}.secret`, encrypted, {spaces: 2});
    },
    _recover: function() {
        let encrypted = jsonFile.readFileSync(`./store/vaults/vault-${this.code}.secret`);
        return cryptoJSON.decrypt(encrypted, secret);
    },
    _toYAML: function() {
        return YAML.stringify(JSON.parse(JSON.stringify(this)));
    }
};

module.exports = Vault;