/**
 * refresh proxy configuration, according to a specific environment
 */

const Servers = require('../entities/servers');
const ansibleContextBuilder = require('../ansible/ansible-context-builder');
const fs = require('fs');
const AnsibleClient = require('../ansible/ansible-client');
const YAML = require('yamljs');

module.exports = function(orderDirectory, environment) {
    let inventory, vars;

    const inventoryFn = async () => {
        inventory = {
            proxy: Servers.getProxyHost(),
        };

        return inventory;
    };

    const varsFn = async () => {
        let values = {
            environment_id: environment.id,
            hosts: environment.domains,
            services: environment.services.map(service => {
                let path = service.path,
                    port = Servers.getServicePort(environment._getServiceInstanceCode(service)),
                    host = 'localhost';
                console.log('>> service', path, port, host);
                return {path, port, host};
            })
        };

        vars = {
            ...values,
            _toYAML: function() {
                return YAML.stringify(values);
            }
        };

        return vars;
    };

    const updateRouting = async () => {
        let execDirectory = prepareTmpDirectory(orderDirectory);
        let context = ansibleContextBuilder(execDirectory, inventory, vars, 'refresh-proxy');
        let client = new AnsibleClient(context);
        return client.exec().then(result => {
            if(result.success) {
                // do something if necessary
            }

            return result;
        });
    };

    const endMock = async () => {
        console.log('we mock proxy configuration (generate env + touch)')
    };

    return Promise
        .all([
            inventoryFn(),
            varsFn()
        ])
        .then(() => updateRouting())
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