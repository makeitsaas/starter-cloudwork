import { AnsibleConfig } from '../ansible-config';
const NodeAnsible = require('../modules/node-ansible/index');
const ansibleOutputParser = require('../modules/ansible-output-parser/index');

export class PlaybookExecutor {
    constructor(private directory: string, private logger?: {log: Function, error: Function, result: Function}) {
    }

    exec() {
        const executablePlaybook = this.getExecutablePlaybook();

        const promise = executablePlaybook
            .inventory(`${this.directory}/inventories/hosts`)
            .playbook(`${this.directory}/dynamic-playbook`)
            .exec();

        return promise
            .then((stats: any) => {
                console.log("\ncode :", stats.code, "\n"); // Exit code of the executed command
                const parsed = ansibleOutputParser(stats.output);
                this.logger && this.logger.result(parsed);
                if (parsed.success) {
                    return parsed;
                } else {
                    throw parsed;
                }
            });
    }

    getExecutablePlaybook() {
        const playbook = new NodeAnsible.Playbook()
            //.inventory('config/inventories/dev')
            .privateKey(AnsibleConfig.getKeyPath())
            .user('ubuntu')
            .sshExtraArgs('"-o StrictHostKeyChecking=no"')
            .verbose('v');
        // .verbose('vvvv');

        playbook.on('stdout', (data: any) => {
            process.stdout.write('.');
            this.logger && this.logger.log(data);
        });

        playbook.on('stderr', (data: any) => {
            process.stdout.write('x');
            this.logger && this.logger.error(data);
        });

        return playbook;
    }
}
