// exécute les commandes ansible qui peuvent également être déclenchées manuellement
// load les configs + prépare le client Ansible (path des scripts, ...)
//const Ansible = require('node-ansible'); -> not maintained + output parsed + detailed error

const Ansible = require('./modules/node-ansible/index');
const ansibleOutputParser = require('./modules/ansible-output-parser');
const fs = require('fs');
const keyPath = 'config/keys/server-key';
var privateKey = fs.readFileSync(keyPath, 'utf8'); // check here if key exists => handle error

var playbook = new Ansible.Playbook()
    .inventory('config/inventories/dev')
    .privateKey(keyPath)
    .user('ubuntu');

playbook.on('stdout', function (data) {
    process.stdout.write('.');
});
playbook.on('stderr', function (data) {
    process.stdout.write('x');
});

module.exports = {
    exec: function (playbookName, options) {
        const promise = playbook.playbook(`../ansible/${playbookName}`)
            .exec();
        return promise.catch(e => e).then(function (stats) {
            console.log("\ncode :", stats.code, "\n"); // Exit code of the executed command
            const parsed = ansibleOutputParser(stats.output);
            return parsed;
        });
    }
}
