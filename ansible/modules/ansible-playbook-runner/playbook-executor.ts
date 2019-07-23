// exécute les commandes ansible qui peuvent également être déclenchées manuellement
// load les configs + prépare le client Ansible (path des scripts, ...)
//const Ansible = require('node-ansible'); -> not maintained + output parsed + detailed error

import { AnsibleExecutionClient } from '@custom-modules/ansible-execution-client';

const Ansible = require('../../modules/node-ansible/index');
const ansibleOutputParser = require('../../modules/ansible-output-parser/index');

const keyPath = 'config/keys/server-key';

const playbook = new Ansible.Playbook()
//.inventory('config/inventories/dev')
    .privateKey(keyPath)
    .user('ubuntu');

playbook.on('stdout', (data: any) => process.stdout.write('.'));
playbook.on('stderr', (data: any) => process.stdout.write('x'));

export class PlaybookExecutor {
    constructor(
        private context: AnsibleExecutionClient
    ) {
    }

    exec() {
        const promise = playbook
            .inventory(`${this.context.getDirectory()}/inventories/hosts`)
            .playbook(`${this.context.getDirectory()}/root-playbook`)
            .exec();

        return promise
            .catch((e: any) => console.log('error (playbook-executor)', e))
            .then((stats: any) => {
                console.log("\ncode :", stats.code, "\n"); // Exit code of the executed command
                this.context.writeLogs(stats.output);
                const parsed = ansibleOutputParser(stats.output);
                if (parsed.success) {
                    return parsed;
                } else {
                    throw parsed;
                }
            });
    }
}
