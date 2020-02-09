import {
    AnsibleExecutionClient, AnsibleInventoryInterface,
    AnsibleVarsInterface
} from '@custom-modules/ansible-execution-client';
import { Environment, ServiceDeployment } from '@entities';
import { CliHelper, ConfigReader, SinglePlaybookConfig } from '@utils';
import { ModeConfig } from '../src/core/mode/cli-mode-loader';
import { LambdaServer } from '@entities';

export interface IPlaybookInputObjects {
    environment: Environment
    deployment?: ServiceDeployment
    lambdaServer?: LambdaServer
}

export class Playbook {

    /**
     * Main properties
     */
    readonly ready: Promise<any>;
    private playbookConfig: SinglePlaybookConfig;

    /**
     * Execution properties
     */
    private executionClient: AnsibleExecutionClient;
    private vars: AnsibleVarsInterface;
    private inventory: AnsibleInventoryInterface;

    /**
     * Convenience properties
     */
    private environment: Environment;
    readonly deployment?: ServiceDeployment;
    readonly lambdaServer?: LambdaServer;

    /**
     * DI properties
     */
    // @service
    // private vaultService: VaultService;

    /**
     * Constructor-set properties
     *
     * @param name
     * @param inputObjects
     * @param interactive
     */
    constructor(
        name: string,
        inputObjects: IPlaybookInputObjects,
        private interactive: boolean = false
    ) {
        this.environment = inputObjects.environment;
        this.deployment = inputObjects.deployment;
        this.lambdaServer = inputObjects.lambdaServer;
        this.playbookConfig = ConfigReader.playbooks.getConfig(name);
        this.ready = Promise.all([
            this.loadVars(),
            this.loadInventory()
        ]).then(async () => {
            this.executionClient = new AnsibleExecutionClient(this.vars, this.inventory, name);
            await this.executionClient.prepare();
        }).catch(async e => this.onInitError(e));
    }

    /*
     * ---------------
     * Public methods
     * ---------------
     */

    async getDirectory(): Promise<string> {
        await this.ready;
        return this.executionClient.getDirectory();
    }

    async execute() {
        await this.ready;
        let error;

        if (ModeConfig.executePlaybooks) {
            console.log('execution start');
            try {
                await this.executionClient.execute();
            } catch (e) {
                console.log('playbook execution error');
                console.log(e);
                error = e;
            }
        }

        await this.onDone();

        if (error) {
            throw error;
        }

        return this;
    }

    /*
     * ---------------
     * Private methods
     * ---------------
     */

    private async loadVars(): Promise<AnsibleVarsInterface> {
        // get expected values, either from vault or ask user ! ! !
        const required = this.getRequiredVariablesNames();
        const commonVars = await this.getCommonVariables();
        const deploymentVars = await this.getDeploymentVariables();

        const discovery = await this.getDiscoveryConfig();

        console.log('deployment variables', deploymentVars);

        this.vars = {
            ...commonVars,
            ...deploymentVars,
            discovery
        };

        for (let i in required) {
            let key = required[i];
            let interactiveValue = await CliHelper.askInteractively(key);
            await this.saveInteractiveValue(key, interactiveValue);
            this.vars[key] = interactiveValue;
        }

        return this.vars;
    }

    private async loadInventory(): Promise<AnsibleInventoryInterface> {
        this.inventory = {};

        if (this.lambdaServer) {
            this.inventory['lambda-server'] = this.lambdaServer.ip;
        }

        return {};
    }

    private async getDiscoveryConfig() {
        return await this.environment.generateDiscoveryConfig();
    }

    private async getCommonVariables(): Promise<any> {
        return {}
    }

    private async getDeploymentVariables(): Promise<any> {
        return {};
    }

    private getRequiredVariablesNames(): string[] {
        return this.playbookConfig.variables
            .filter(variable => variable.required)
            .map(variable => variable.key);
    }

    private async saveInteractiveValue(key: string, value: string) {
        console.log('save interactively', key, value);
        // const vault = await this.getVault(key);
        // vault.addValue(key, value);
        // await vault.save();
    }

    private async onInitError(e: Error) {
        await this.onDone();
        throw e;
    }

    private async onDone() {
        if (this.lambdaServer) {
            await this.lambdaServer.release();
        }
    }
}
