const jsonFile = require('jsonfile');
const serverConfigPath = './store/servers/servers-configuration.json';

let serverConfig = jsonFile.readFileSync(serverConfigPath);
const minPort = 3000;
const maxPort = 9999;

module.exports = {
    getAvailableComputingHost: function() {
        return serverConfig.computing.servers[0].ip;
    },
    getAvailableComputingPort: function(ip, serviceCode) {
        let port = minPort;
        while(port < maxPort && !this.isPortAvailable(ip, port)) {
            port++;
        }
        if(port >= maxPort) {
            return false;
        }

        this.bookPort(ip, port, serviceCode);

        return port;
    },
    isPortAvailable: function(ip, port) {
        const serverType = 'computing';
        if(!serverConfig[serverType])
            return false;

        let target = serverConfig[serverType].servers.filter(server => server.ip === ip)[0];
        console.log('/!\\ /!\\ /!\\ /!\\ /!\\ /!\\ /!\\ /!\\', ip, port, target);
        console.log('isPortavailable', ip, port, target);

        return target && !target.ports[port];
    },
    bookPort: function(ip, port, serviceCode)
    {
        const serverType = 'computing';
        if(!serverConfig[serverType])
            return false;

        let found = false;
        serverConfig[serverType].servers.map(server => {
            if(server.ip === ip) {
                server.ports[port] = {
                    "type": "auto",
                    serviceCode
                };
                found = true;
            }
        });

        if(found) {
            this._persist();
        }

        return found;
    },
    getAvailableDbHost: function() {
        return serverConfig.daemons.servers[0].ip;
    },
    _persist: function() {
        return jsonFile.writeFileSync(serverConfigPath, serverConfig, {spaces: 2});
    }
};