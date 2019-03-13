const jsonFile = require('jsonfile');
const serverConfigPath = './store/servers/servers-configuration.json';

let serverConfig = jsonFile.readFileSync(serverConfigPath);
const minPort = 3000;
const maxPort = 9999;
let tmpAllocatedPorts = [3000, 3001];

module.exports = {
    getAvailableComputingHost: function() {
        return serverConfig.computing.servers[0].ip;
    },
    getAvailableComputingPort: function(computingIP) {
        let port = minPort;
        while(port < maxPort && tmpAllocatedPorts.indexOf(port) !== -1) {
            port++;
        }
        if(port >= maxPort) {
            return false;
        }
        tmpAllocatedPorts.push(port);

        return port;
    },
    getAvailableDbHost: function() {
        return serverConfig.daemons.servers[0].ip;
    },
    persist: function() {
        return jsonFile.writeFileSync(serverConfigPath, serverConfig, {spaces: 2});
    }
};