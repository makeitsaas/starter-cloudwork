/**
 * deploys all new setup of a single service : database + computing
 * i.e. : depending on the case, will create or update db/repo
 * doesn't handle the cleaning part (which depends on success of other services deployment)
 *
 * [local] generate service codeName and hosts'
 * [local] generate db codeName'
 * [daemons] create DB with USER'
 * [local] store db/user create status, names and password, version'
 * [computing] clone repo'
 * [computing] generate .env'
 * [computing] pm2 start service'
 * [computing] store namespace, status, version'
 *
 */

const Vault = require('../entities/vault');
const log = require('../modules/logger/logger')('environment-create');
const ansibleContextBuilder = require('../ansible/ansible-context-builder');
const fs = require('fs');
const Servers = require('../entities/servers');

module.exports = function(orderDirectory, currentEnvironment, desiredService) {

    const computingIP = Servers.getAvailableComputingHost();
    const daemonsIP = Servers.getAvailableDbHost();
    const serviceCode = `e${currentEnvironment.id}-s${desiredService.id}`;

    let inventory, vars;

    const serviceStateFn = async () => {
        // new service has previous state
        const previousService = currentEnvironment._getService(desiredService.id);
        desiredService.deployStatus = previousService.deployStatus;
        desiredService.databaseStatus = previousService.databaseStatus;

        return desiredService;
    };

    const inventoryFn = async () => {
        inventory = {
            daemons: daemonsIP,
            computing: computingIP
        };

        return inventory;
    };

    const varsFn = async () => {
        let vault = new Vault(serviceCode);
        let newValues = {
            repo_url: desiredService.repo_url,
            repo_directory: serviceCode,
            service_port: Servers.getAvailableComputingPort(computingIP),
            db_hostname: daemonsIP,
            db_database: 'auto_db_' + serviceCode.replace('-', '_'),
            db_username: 'auto_user_' + serviceCode.replace('-', '_'),
            db_password: 'password' // generate secure password
        };

        for(let key in newValues) {
            if(!vault[key]) {
                vault[key] = newValues[key];
            }
        }
        vault._persist();

        vars = vault;

        return vars;
    };

    const generateDb = async () => {
        if(desiredService._isDatabaseReady()) {
            log('do not generateDb');
            return true;
        } else {
            log('do generateDb');
            let execDirectory = prepareTmpDirectory(orderDirectory);
            let context = ansibleContextBuilder(execDirectory, inventory, vars, 'database-create');
            desiredService._setDatabaseReady();
        }
    };

    const deploySrc = async () => {
        log('do deploySrc');
        let execDirectory = prepareTmpDirectory(orderDirectory);
        let context = ansibleContextBuilder(execDirectory, inventory, vars, 'deploy-single');
        desiredService._setDeployReady();
    };

    const endMock = async () => {
        await timeout(100 + Math.random() * 100);
        log('mock service update', desiredService);
        currentEnvironment._updateService(desiredService);
        return 1;
    };

    return Promise
        .all([
            serviceStateFn(),
            inventoryFn(),
            varsFn()
        ])
        .then(() => generateDb())
        .then(() => deploySrc())
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