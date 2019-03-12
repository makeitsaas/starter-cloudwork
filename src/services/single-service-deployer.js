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

module.exports = function(orderDirectory, currentEnvironment, serviceDesired) {

    const directoryFn = async () => {
        return prepareTmpDirectory(orderDirectory);
    };

    const inventoryFn = async () => {
        return {
            daemons: Servers.getAvailableDbHost(),
            computing: Servers.getAvailableComputingHost()
        };
    };

    const varsFn = async () => {
        return {
            db_hostname: 'a',
            db_database: 'b',
            db_username: 'c',
            db_password: 'd'
        };
    };

    return new Promise((resolve, reject) => {
        Promise.all([
            directoryFn(),
            inventoryFn(),
            varsFn()
        ]).then(args => {
            return ansibleContextBuilder(...args, 'database-drop');
        }).then(() => {
            setTimeout(() => {
                log('mock service update', serviceDesired);
                let vault = Vault.getVault(currentEnvironment._meta, serviceDesired);
                log('vault for this service', vault);
                resolve(1);
            }, 100 + Math.random() * 100);
        });
    });
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