// exécute les commandes ansible qui peuvent également être déclenchées manuellement
// load les configs + prépare le client Ansible (path des scripts, ...)
//const Ansible = require('node-ansible'); -> not maintained + output parsed + detailed error

const Ansible = require('../../modules/node-ansible/index');
const ansibleOutputParser = require('../../modules/ansible-output-parser/index');
const keyPath = 'config/keys/server-key';

const playbook = new Ansible.Playbook()
    //.inventory('config/inventories/dev')
    .privateKey(keyPath)
    .user('ubuntu');

playbook.on('stdout', function (data) {
    process.stdout.write('.');
});
playbook.on('stderr', function (data) {
    process.stdout.write('x');
});

function AnsibleClient(context) {
    this.context = context;
}

AnsibleClient.prototype = {
    exec: function () {
        const promise = playbook
            .inventory(`${this.context.getPath()}/inventories/hosts`)
            .playbook(`${this.context.getPath()}/root-playbook`)
            .exec();

        return promise.catch(e => e).then((stats) => {
            console.log("\ncode :", stats.code, "\n"); // Exit code of the executed command
            this.context.writeLogs(stats.output);
            const parsed = ansibleOutputParser(stats.output);
            if(parsed.success) {
                return parsed;
            } else {
                throw parsed;
            }
        });
    }
};


module.exports =  AnsibleClient;
