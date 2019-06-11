import * as fs from 'fs';
const YAML = require('yamljs');

const ansiblePLaybookRelativePath = '../../playbooks';
const ansibleTemplatesRelativePath = '../../templates';
const tmpDirectoryRelativePath = '../../../tmp';

export interface AnsibleInventoryInterface {
    [id: string]: string
}

export interface AnsibleVarsInterface {
    [id: string]: string|number;
}

export class AnsibleExecutionClient {
    private ready: Promise<any>;
    private executionAbsoluteDirectory: string;

    constructor(
        private vars: AnsibleVarsInterface,
        private inventory: AnsibleInventoryInterface,
        private playbookName: string
    ) {
    }

    /*
     * ---------------
     * Public methods
     * ---------------
     */

    public prepare() {
        if(!this.ready) {
            this.ready = this.getExecutionDirectory()
                .then(() => Promise.all([
                    this.writeInventoryFile(),
                    this.writeVarsFile(),
                    this.copyPlaybook(),
                    this.linkPlaybooksDirectory(),
                    this.linkTemplatesDirectory()
                ]));
        }

        return this.ready;
    }

    public getDirectory(): string {
        return this.executionAbsoluteDirectory;
    }

    /*
     * ---------------
     * Private methods
     * ---------------
     */

    private async getExecutionDirectory() {
        const basePath = `${__dirname}/${tmpDirectoryRelativePath}`;
        let i = 1;
        let available = false;
        const generatePath = (i:number) => {
            return `${basePath}/playbook-execution-${i}`;
        };
        while(!available) {
            this.executionAbsoluteDirectory = generatePath(i++);
            available = this.isFolderAvailable(this.executionAbsoluteDirectory);
        }
        fs.mkdirSync(this.executionAbsoluteDirectory);
    }

    private writeInventoryFile() {
        let inventoryDir = this.executionAbsoluteDirectory + '/inventories',
            inventoryFile = inventoryDir + '/hosts',
            inventoryFileContent = '';

        for(let key in this.inventory) {
            inventoryFileContent +=`[${key}]\n`;
            inventoryFileContent +=`${this.inventory[key]}\n\n`;
        }

        fs.mkdirSync(inventoryDir);
        fs.writeFileSync(inventoryFile, inventoryFileContent);
    }

    private writeVarsFile() {
        let varsDir = this.executionAbsoluteDirectory + '/vars',
            varsFile = varsDir + '/default.yml';
        fs.mkdirSync(varsDir);
        console.log(this.getVarsYAML());
        fs.writeFileSync(varsFile, this.getVarsYAML());
    }

    private copyPlaybook() {
        fs.copyFileSync(`${__dirname}/${ansiblePLaybookRelativePath}/${this.playbookName}.yml`, this.executionAbsoluteDirectory + '/root-playbook.yml');
    }

    private linkPlaybooksDirectory() {
        fs.symlinkSync(`${__dirname}/${ansiblePLaybookRelativePath}`, `${this.executionAbsoluteDirectory}/playbooks`);
    }

    private linkTemplatesDirectory() {
        fs.symlinkSync(`${__dirname}/${ansibleTemplatesRelativePath}`, `${this.executionAbsoluteDirectory}/templates`);
    }

    private getVarsYAML(): string {
        return YAML.stringify(this.vars);
    }

    private isFolderAvailable(path: string): boolean {
        try {
            return !fs.existsSync(path);
        } catch(err) {
            return true;
        }
    }
}
