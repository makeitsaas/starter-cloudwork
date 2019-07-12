import {
    AnsibleExecutionClient, AnsibleInventoryInterface,
    AnsibleVarsInterface
} from '@custom-modules/ansible-execution-client';
import { AbstractBaseVault, Environment, EnvironmentVault, ServiceDeployment, ServiceDeploymentVault } from '@entities';
import { CliHelper, ConfigReader, SinglePlaybookConfig } from '@utils';
import { VaultService } from '@services';
import { service } from '@decorators';
import { ModeConfig } from '../src/core/mode/cli-mode-loader';

export interface EnvironmentCommonVariablesInterface {
    environment_id: string
    hosts: string[]
    services: any[]
}

export class Playbook {

    readonly ready: Promise<any>;
    private executionClient: AnsibleExecutionClient;
    private vars: AnsibleVarsInterface;
    private inventory: AnsibleInventoryInterface;
    private playbookConfig: SinglePlaybookConfig;
    private vault: EnvironmentVault;
    private deploymentVault?: ServiceDeploymentVault;

    @service
    private vaultService: VaultService;

    constructor(
        private name: string,
        private environment: Environment,
        private deployment?: ServiceDeployment,
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
        if (ModeConfig.executePlaybooks) {
            console.log('execution start');
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

        this.vars = {
            ...commonVars,
            ...deploymentVars
        };

        for (let i in required) {
            let key = required[i];
            let vaultValue = await this.getVaultVariable(key);
            if (vaultValue) {
                this.vars[key] = vaultValue;
            } else if (!this.vars[key] && this.interactive) {
                let interactiveValue = await CliHelper.askInteractively(key);
                await this.saveInteractiveValue(key, interactiveValue);
                this.vars[key] = interactiveValue;
            }
        }

        return this.vars;
    }

    private async loadInventory(): Promise<AnsibleInventoryInterface> {
        this.inventory = {};

        if (this.deployment && this.deployment.service) {
            const computingAllocation = await this.deployment.computingAllocation;
            const port = await (computingAllocation && computingAllocation.allocatedPort);
            if (port) {
                this.inventory.computing = (await port.server).ip;
            }

            const databaseAllocation = await this.deployment.databaseAllocation;
            if (databaseAllocation) {
                let server = await databaseAllocation.server;
                if (server) {
                    this.inventory.database = server.ip;
                }
            }
        }

        const proxy = await this.environment.proxy;
        if (proxy) {
            this.inventory.proxy = proxy.ip;
        }

        return {};
    }

    private async getCommonVariables(): Promise<EnvironmentCommonVariablesInterface> {
        const deployments = await this.environment.deployments;
        return {
            environment_id: this.environment.uuid,
            hosts: this.environment.configuration.domains,
            services: await Promise.all(deployments.map(async deployment => {
                const allocation = await deployment.computingAllocation;
                const computePort = await (allocation && allocation.allocatedPort);
                if (!computePort)
                    throw new Error(`No compute allocation for deployment ${deployment.id}`);
                const computeServer = await computePort.server;
                return {
                    path: deployment.path,
                    repositoryVersion: deployment.repositoryVersion,
                    port: computePort.port,
                    host: computeServer.ip === this.inventory.proxy ? 'localhost' : computeServer.ip
                };
            }))
        }
    }

    private async getDeploymentVariables(): Promise<any> {
        const db = this.deployment && await this.deployment.databaseAllocation;
        const dbServer = db && await db.server;
        const computing = this.deployment && await this.deployment.computingAllocation;
        const computingPort = computing && await computing.allocatedPort;
        return this.deployment && {
            repo_url: this.deployment.service.repositoryUrl,
            db_hostname: dbServer && dbServer.ip,
            service_port: computingPort && computingPort.port,
            redis_hostname: dbServer && dbServer.ip,
            repo_directory: `d${this.deployment.id}`
        } || {};
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
        if (type === 'deployment') {
            if (!this.deployment) {
                throw new Error('Missing deployment');
            }
            if (!this.deploymentVault) {
                this.deploymentVault = await this.vaultService.getDeploymentVault(`${this.deployment.id}`)
            }
            return this.deploymentVault;
        } else {
            if (!this.vault) {
                this.vault = await this.vaultService.getEnvironmentVault(`${this.environment.uuid}`)
            }
            return this.vault;
        }
    }
}
