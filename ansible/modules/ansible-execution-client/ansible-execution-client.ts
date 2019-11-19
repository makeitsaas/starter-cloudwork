import * as fs from 'fs';
import { PlaybookExecutor } from '@custom-modules/playbook-executor';

const yaml = require("js-yaml");
const ansiblePlaybookRelativePath = '../../playbooks';
const ansibleTemplatesRelativePath = '../../templates';
const tmpDirectoryRelativePath = '../../../tmp';

export interface AnsibleInventoryInterface {
    [id: string]: string
}

export interface AnsibleVarsInterface {
    [id: string]: string | number | any;
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
        if (!this.ready) {
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

    public log(data: any) {
        fs.appendFileSync(this.getStdoutFilePath(), data);
    }

    public error(data: any) {
        fs.appendFileSync(this.getStderrFilePath(), data);
    }

    public getStdoutFilePath(): string {
        return `${this.executionAbsoluteDirectory}/stdout.log`;
    }

    public getStderrFilePath(): string {
        return `${this.executionAbsoluteDirectory}/stderr.log`;
    }

    public execute() {
        const runner = new PlaybookExecutor(this);
        return runner.exec();
    }

    public writeLogs(logs: any) {
        fs.writeFileSync(this.getDirectory() + '/root-playbook.log', logs);
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
        const generatePath = (i: number) => {
            return `${basePath}/playbook-execution-${i}`;
        };
        while (!available) {
            this.executionAbsoluteDirectory = generatePath(i++);
            available = this.isFolderAvailable(this.executionAbsoluteDirectory);
        }
        fs.mkdirSync(this.executionAbsoluteDirectory);
    }

    private writeInventoryFile() {
        let inventoryDir = this.executionAbsoluteDirectory + '/inventories',
            inventoryFile = inventoryDir + '/hosts',
            inventoryFileContent = '';

        for (let key in this.inventory) {
            inventoryFileContent += `[${key}]\n`;
            inventoryFileContent += `${this.inventory[key]}\n\n`;
        }

        fs.mkdirSync(inventoryDir);
        fs.writeFileSync(inventoryFile, inventoryFileContent);
    }

    private writeVarsFile() {
        let varsDir = this.executionAbsoluteDirectory + '/vars',
            varsFile = varsDir + '/default.yml';
        fs.mkdirSync(varsDir);
        // console.log(this.getVarsYAML());
        fs.writeFileSync(varsFile, this.getVarsYAML());
    }

    private copyPlaybook() {
        fs.copyFileSync(`${__dirname}/${ansiblePlaybookRelativePath}/${this.playbookName}.yml`, this.executionAbsoluteDirectory + '/root-playbook.yml');
    }

    private linkPlaybooksDirectory() {
        fs.symlinkSync(`${__dirname}/${ansiblePlaybookRelativePath}`, `${this.executionAbsoluteDirectory}/playbooks`);
    }

    private linkTemplatesDirectory() {
        fs.symlinkSync(`${__dirname}/${ansibleTemplatesRelativePath}`, `${this.executionAbsoluteDirectory}/templates`);
    }

    private getVarsYAML(): string {
        return yaml.dump(this.vars);
    }

    private isFolderAvailable(path: string): boolean {
        try {
            return !fs.existsSync(path);
        } catch (err) {
            return true;
        }
    }
}
