/**
 * drops one service (compute + database)
 */

const Vault = require('../entities/vault');
const log = require('../modules/logger/logger')('environment-create');
const ansibleContextBuilder = require('../ansible/ansible-context-builder');
const fs = require('fs');
const Servers = require('../entities/servers');
const AnsibleClient = require('../ansible/ansible-client');
module.exports = function(orderDirectory, currentEnvironment, service) {

    const computingIP = Servers.getAvailableComputingHost();
    const daemonsIP = Servers.getAvailableDbHost();
    const serviceCode = currentEnvironment._getServiceInstanceCode(service);

    let inventory, vars;

    const inventoryFn = async () => {
        inventory = {
            daemons: daemonsIP,
            computing: computingIP
        };

        return inventory;
    };

    const varsFn = async () => {
        vars = new Vault(serviceCode);
        return vars;
    };

    const dropDb = async () => {
        // if(service._hasDatabase()) {
            log('do dropDb');
            let execDirectory = prepareTmpDirectory(orderDirectory);
            let context = ansibleContextBuilder(execDirectory, inventory, vars, 'database-drop');
            let client = new AnsibleClient(context);
            return client.exec().then(result => {
                if(result.success) {
                    service._setDatabaseNone();
                }

                return result;
            });
        // }
    };

    /*const deploySrc = async () => {
        log('do deploySrc');
        let execDirectory = prepareTmpDirectory(orderDirectory);
        let context = ansibleContextBuilder(execDirectory, inventory, vars, 'deploy-single');
        let client = new AnsibleClient(context);

        return client.exec().then(result => {
            if(result.success) {
                desiredService._setDeployReady();
            }

            return result;
        });

    };*/

    const endMock = async () => {
        await timeout(100 + Math.random() * 100);
        //log('mock service update', desiredService);
        currentEnvironment._removeService(service.id);
        return 1;
    };

    return Promise
        .all([
            inventoryFn(),
            varsFn()
        ])
        .then(() => dropDb())
        //.then(() => dropCompute())
        .then(() => endMock());
};

function prepareTmpDirectory(orderDirectory) {
    let ansiblePath = orderDirectory + '/ansible';
    if (!fs.existsSync(ansiblePath)){
        fs.mkdirSync(ansiblePath);
    }

    let i = 1, playbookPath = generatePlaybookPath(ansiblePath, i);

    while(fs.existsSync(playbookPath)) {
        i++;
        playbookPath = generatePlaybookPath(ansiblePath, i);
    }

    fs.mkdirSync(playbookPath);
    return playbookPath;
}

function generatePlaybookPath(ansiblePath, i) {
    return ansiblePath + '/playbook-' + i;
}

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
