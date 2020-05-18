import * as fs from "fs";
import { AnsibleConfig } from "../ansible-config";
const jsonFile = require('jsonfile');

const generateDirectoryFromNumber = (n: number) => {
    return `playbook-${n}`;
};

/*
    root
     |- tmp
         |- playbook-xxx
             |- result.json
             |- stdout.log
             |- stderr.log
             |- inventory
                 |- default.yml
             |- vars
                 |
                 |- default.yml
 */

export class PlaybookDirectoryHelper {
    private playbookNumber: number = 0;
    private playbookDirectory: string;

    getTmpDirectory(): string {
        return AnsibleConfig.getExecutionDirectory();
    }

    getContextDirectory(): string {
        while (!this.isPlaybookDirectoryValid()) {
            this.playbookNumber++;
            if (this.isNumberAvailable()) {
                this.playbookDirectory = `playbook-${this.playbookNumber}`;
                const absolutePath = `${this.getTmpDirectory()}/${this.playbookDirectory}`;
                fs.mkdirSync(absolutePath);
            }
        }

        return `${this.getTmpDirectory()}/${this.playbookDirectory}`;
    }

    writeFile(fileName: string, fileContent: string): void {
        const absolutePath = `${this.getContextDirectory()}/${fileName}`;
        this.ensureFileHasDirectory(fileName);
        fs.writeFileSync(absolutePath, fileContent);
    }

    copyFile(fileToCopyAbsolutePath: string, targetRelativePath: string) {
        const targetAbsolutePath = `${this.getContextDirectory()}/${targetRelativePath}`;
        this.ensureFileHasDirectory(targetRelativePath);
        fs.copyFileSync(fileToCopyAbsolutePath, targetAbsolutePath);
    }

    ensureFileHasDirectory(fileRelativePath: string) {
        const directories = fileRelativePath.split('/').slice(0, -1);
        if (directories.length) {
            this.ensureDirectoryExists(directories.join('/'));
        }
    }

    ensureDirectoryExists(pathInContext: string) {
        const absolutePath = `${this.getContextDirectory()}/${pathInContext}`;
        if (!fs.existsSync(absolutePath)) {
            fs.mkdirSync(absolutePath);
        }
    }

    getLogger(): PlaybookLogger {
        return new PlaybookLogger(this.getContextDirectory());
    }

    isNumberAvailable(): boolean {
        const absolutePath = `${this.getTmpDirectory()}/${generateDirectoryFromNumber(this.playbookNumber)}`;
        return !fs.existsSync(absolutePath);
    }

    isPlaybookDirectoryValid(): boolean {
        return !!this.playbookDirectory;
    }
}

class PlaybookLogger {
    constructor(private directory: string) {
    }

    public log(data: any) {
        fs.appendFileSync(this.getStdoutFilePath(), data);
    }

    public error(data: any) {
        fs.appendFileSync(this.getStderrFilePath(), data);
    }

    public result(data: any) {
        jsonFile.writeFileSync(this.getResultFilePath(), data, { spaces: 2, EOL: '\r\n' });
        // fs.writeFileSync(this.getResultFilePath(), JSON.stringify(data));
    }

    private getResultFilePath(): string {
        return `${this.directory}/result.json`;
    }

    private getStdoutFilePath(): string {
        return `${this.directory}/stdout.log`;
    }

    private getStderrFilePath(): string {
        return `${this.directory}/stderr.log`;
    }
}
