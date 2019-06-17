import {
    AnsibleExecutionClient, AnsibleInventoryInterface,
    AnsibleVarsInterface
} from './modules/ansible-execution-client/ansible-execution-client';
import { ConfigReader, SinglePlaybookConfig } from '../app/scheduler/lib/config-reader';
import { AbstractBaseVault, Environment, EnvironmentVault, ServiceDeployment, ServiceDeploymentVault } from '@entities';
import { CliHelper } from '../app/scheduler/lib/cli-helper';

export class Playbook {

    readonly ready: Promise<any>;
    private executionClient: AnsibleExecutionClient;
    private vars: AnsibleVarsInterface;
    private inventory: AnsibleInventoryInterface;
    private playbookConfig: SinglePlaybookConfig;

    constructor(
        private name: string,
        private environment: Environment,
        private vault: EnvironmentVault,
        private deployment?: ServiceDeployment,
        private deploymentVault?: ServiceDeploymentVault,
        private interactive: boolean = false
    ) {
        this.playbookConfig = ConfigReader.playbooks.getConfig(this.name);
        this.ready = Promise.all([
            this.loadVars(),
            this.loadInventory()
        ]).then(async () => {
            this.executionClient = new AnsibleExecutionClient(this.vars, this.inventory, this.name);
            await this.executionClient.prepare();
        });
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
        console.log('we can execute now');
    }

    /*
     * ---------------
     * Private methods
     * ---------------
     */

    private async loadVars(): Promise<AnsibleVarsInterface> {
        // get expected values, either from vault or ask user ! ! !
        const required = this.getRequiredVariablesNames();
        const vars: AnsibleVarsInterface = {};
        console.log('vaults');
        console.log(this.deploymentVault && this.deploymentVault.getValues());
        console.log(this.vault.getValues());

        for (let i in required) {
            let key = required[i];
            let vaultValue = await this.getVaultVariable(key);
            if (vaultValue) {
                vars[key] = vaultValue;
            } else if (this.interactive) {
                let interactiveValue = await CliHelper.askInteractively(key);
                await this.saveInteractiveValue(key, interactiveValue);
                vars[key] = interactiveValue;
            }
        }

        this.vars = vars;

        return vars;
    }

    private async loadInventory(): Promise<AnsibleInventoryInterface> {
        this.inventory = {};

        if(this.deployment && this.deployment.service) {
            if(
                this.deployment.computingAllocation
                && this.deployment.computingAllocation.allocatedPort
            ) {
                this.inventory.computing = (await this.deployment.computingAllocation.allocatedPort.server).ip;
            }
            if(this.deployment.databaseAllocation) {
                let server = await this.deployment.databaseAllocation.server;
                if(server) {
                    this.inventory.database = server.ip;
                }
            }
        }

        const proxy = await this.environment.proxy;
        if(proxy) {
            this.inventory.proxy = proxy.ip;
        }

        return {};
    }

    private getRequiredVariablesNames(): string[] {
        return this.playbookConfig.variables
            .filter(variable => variable.required)
            .map(variable => variable.key);
    }

    private async saveInteractiveValue(key: string, value: string) {
        const vault = await this.getVault(key);
        vault.addValue(key, value);
        await vault.save();
    }

    private async getVaultVariable(key: string): Promise<string> {
        const vault = await this.getVault(key);

        return vault.getValue(key);
    }

    private async getVault(key: string): Promise<AbstractBaseVault> {
        const type = ConfigReader.playbooks.getVariableVaultType(key);
        if(type === 'deployment') {
            if(!this.deploymentVault) {
                throw new Error('Missing deployment vault');
            }
            return this.deploymentVault;
        } else {
            return this.vault;
        }
    }
}
