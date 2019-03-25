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

// NOTE : modeling shall reflect exactly the process.
/*
    On ne doit pas remplacer le service dans environment par un nouveau, mais manipuler dans un seul objet la mise à jour
    => afin de pouvoir rapprocher directement ce qu'on est en train de faire, et en cas d'échec de connaître l'état du déploiement
 */

const Vault = require('../entities/vault');
const log = require('../modules/logger/logger')('environment-create');
const ansibleContextBuilder = require('../ansible/ansible-context-builder');
const fs = require('fs');
const Servers = require('../entities/servers');
const AnsibleClient = require('../ansible/ansible-client');
module.exports = function(orderDirectory, currentEnvironment, desiredService) {

    const computingIP = Servers.getAvailableComputingHost();
    const daemonsIP = Servers.getAvailableDbHost();
    const serviceCode = currentEnvironment._getServiceInstanceCode(desiredService);

    let inventory, vars;

    const serviceStateFn = async () => {
        // new service has previous state
        const previousService = currentEnvironment._getService(desiredService.id);
        if(previousService) {
            desiredService.deployStatus = previousService.deployStatus;
            desiredService.databaseStatus = previousService.databaseStatus;
        }

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
            //repo_url: desiredService.repo_url,
            environment_domain: currentEnvironment.domains[0],
            repo_directory: serviceCode,
            //service_port: Servers.getAvailableComputingPort(computingIP),
            redis_hostname: daemonsIP,
            db_hostname: daemonsIP,
            db_database: 'auto_db_' + serviceCode.replace('-', '_'),
            db_username: 'auto_user_' + serviceCode.replace('-', '_'),
            db_password: 'password' // generate secure password
        };

        if(true) {
            // NOTE : below the variables set by the user (above vars were established by the deployer)
            let oauthClients = {
                github_client_id: process.env.GITHUB_CLIENT_ID || '',
                github_client_secret: process.env.GITHUB_CLIENT_SECRET || '',
                github_callback_url: process.env.GITHUB_CALLBACK_URL || ''
            };

            newValues = {
                ...newValues,
                ...oauthClients
            }
        }

        for(let key in newValues) {
            if(!vault[key]) {
                vault[key] = newValues[key];
            }
        }

        if(desiredService.repo_url) {
            vault.repo_url = desiredService.repo_url;
        }

        if(!vault.service_port) {
            vault.service_port = Servers.getAvailableComputingPort(computingIP, serviceCode);
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
            let client = new AnsibleClient(context);
            return client.exec().then(result => {
                if(result.success) {
                    desiredService._setDatabaseReady();
                }

                return result;
            });
        }
    };

    const deploySrc = async () => {
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

    };

    const endMock = async () => {
        await timeout(100 + Math.random() * 100);
        //log('mock service update', desiredService);
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
