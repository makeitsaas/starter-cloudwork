import { PlaybookDirectoryHelper } from './lib/playbook-directory-helper';
import { AnsibleFileBuilder } from './lib/ansible-file-builder';
import { PlaybookExecutor } from './lib/playbook-executor';

type AnsibleHost = string;

export type AnsibleInventory = {
    [key: string]: AnsibleHost[]
};

export class Playbook {
    private readonly directoryHelper: PlaybookDirectoryHelper = new PlaybookDirectoryHelper();
    private readonly ansibleFileBuilder: AnsibleFileBuilder = new AnsibleFileBuilder();

    constructor(
        private readonly playbookPath: string,
        private readonly vars: any,
        private readonly inventory: AnsibleInventory,
        private readonly options: {
            dependenciesDirectories?: string[],
            removeAfterDone?: boolean,
            varsInFile?: boolean
        } = {}
    ) {
    }

    async setupDirectory() {
        const inventoryFileContent = this.ansibleFileBuilder.buildInventory(this.inventory);
        this.directoryHelper.writeFile(this.getHostsRelativePath(), inventoryFileContent);
        const varsFileContent = this.ansibleFileBuilder.buildVarsFile(this.vars);
        this.directoryHelper.writeFile(this.getVarsRelativePath(), varsFileContent);

        this.directoryHelper.copyFile(`${process.cwd()}/${this.playbookPath}`, 'dynamic-playbook.yml');
    }

    execute(): Promise<any> {
        console.log('cd', this.directoryHelper.getContextDirectory());
        console.log('ansible-playbook -i inventories/hosts dynamic-playbook.yml -v --ssh-extra-args="-o StrictHostKeyChecking=no"');

        const logger = this.directoryHelper.getLogger();
        const executor = new PlaybookExecutor(this.directoryHelper.getContextDirectory(), logger);

        return executor.exec().then((results: any) => {
            // console.log('results', results);
            return results;
        });
    }

    getHostsRelativePath(): string {
        return "inventories/hosts";
    }

    getVarsRelativePath(): string {
        return "vars/default.yml";
    }
}
