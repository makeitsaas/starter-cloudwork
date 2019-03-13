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

    const directoryFn = async () => {
        return prepareTmpDirectory(orderDirectory);
    };

    const inventoryFn = async () => {
        return {
            daemons: daemonsIP,
            computing: computingIP
        };
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

        return vault;
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
                log('mock service update', desiredService);
                currentEnvironment._updateService(desiredService);
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