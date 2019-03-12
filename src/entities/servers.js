const jsonFile = require('jsonfile');
const serverConfigPath = './store/servers/servers-configuration.json';

let serverConfig = jsonFile.readFileSync(serverConfigPath);

module.exports = {
    getAvailableComputingHost: function() {
        return serverConfig.computing.servers[0].ip;
    },
    getAvailableDbHost: function() {
        return serverConfig.daemons.servers[0].ip;
    },
    persist: function() {
        return jsonFile.writeFileSync(serverConfigPath, serverConfig, {spaces: 2});
    }
};