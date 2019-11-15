import {
    AnsibleExecutionClient, AnsibleInventoryInterface,
    AnsibleVarsInterface
} from '@custom-modules/ansible-execution-client';
import { AbstractBaseVault, Environment, EnvironmentVault, ServiceDeployment, ServiceDeploymentVault } from '@entities';
import { CliHelper, ConfigReader, SinglePlaybookConfig } from '@utils';
import { VaultService } from '@services';
import { service } from '@decorators';
import { ModeConfig } from '../src/core/mode/cli-mode-loader';
import { LambdaServer } from '@entities';

export interface EnvironmentCommonVariablesInterface {
    environment_id: string
    environment_domain_front: string
    environment_domain_api: string
    vhosts: {
        domains: string[]
        services: any[]
    }[]
}

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
    private vault: EnvironmentVault;
    private deploymentVault: ServiceDeploymentVault;
    private environment: Environment;
    readonly deployment?: ServiceDeployment;
    readonly lambdaServer?: LambdaServer;

    /**
     * DI properties
     */
    @service
    private vaultService: VaultService;

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

        if (this.lambdaServer) {
            this.inventory['lambda-server'] = this.lambdaServer.ip;
        }

        const proxy = await this.environment.proxy;
        if (proxy) {
            this.inventory.proxy = proxy.ip;
        }

        return {};
    }

    private async getCommonVariables(): Promise<EnvironmentCommonVariablesInterface> {
        const deployments = await this.environment.deployments;
        const servicesRouting = await Promise.all(deployments.map(async deployment => {
            if (deployment.isAPIDeployment()) {
                const allocation = await deployment.computingAllocation;
                const computePort = await (allocation && allocation.allocatedPort);
                if (!computePort)
                    throw new Error(`No compute allocation for deployment ${deployment.id}`);
                const computeServer = await computePort.server;
                return {
                    behavior: 'api',
                    path: deployment.path,
                    host: computeServer.ip === this.inventory.proxy ? 'localhost' : computeServer.ip,
                    port: computePort.port,
                    secure: false,
                    outputBasePath: null,
                    repositoryVersion: deployment.repositoryVersion,
                };
            } else if (deployment.isSPADeployment()) {
                return {
                    behavior: 'web',
                    path: deployment.path,
                    host: 's3.eu-central-1.amazonaws.com',
                    port: 443,
                    secure: true,
                    outputBasePath: '/makeitsaas-public/auto/angular/initial-test',
                    repositoryVersion: deployment.repositoryVersion,
                };
            } else {
                return {}
            }

        }));

        const vhostsAPI = {
            domains: this.environment.configuration.domains.api,
            services: servicesRouting.filter(service => service.behavior === 'api')
        };

        const vhostsWeb = {
            domains: this.environment.configuration.domains.front,    // automatic prefix for the moment
            services: servicesRouting.filter(service => service.behavior === 'web')
        };

        let vhosts = [vhostsAPI];

        if(vhostsWeb.services.length) {
            vhosts.push(vhostsWeb);
        }

        return {
            environment_id: this.environment.uuid,
            environment_domain_front: this.environment.configuration.domains.front[0] || '',
            environment_domain_api: this.environment.configuration.domains.api[0] || '',
            vhosts
        }
    }

    private async getDeploymentVariables(): Promise<any> {
        const db = this.deployment && await this.deployment.databaseAllocation;
        const dbServer = db && await db.server;
        const computing = this.deployment && await this.deployment.computingAllocation;
        const computingPort = computing && await computing.allocatedPort;

        if (this.deployment && this.deployment.isAPIDeployment()) {
            return {
                repo_url: this.deployment.service.repositoryUrl,
                db_hostname: dbServer && dbServer.ip,
                service_port: computingPort && computingPort.port,
                redis_hostname: dbServer && dbServer.ip,
                repo_directory: `d${this.deployment.id}`,
            };
        } else if (this.deployment && this.deployment.isAPIDeployment()) {
            return this.deployment && {
                repo_url: this.deployment.service.repositoryUrl,
                // cdn_path: this.deployment,
            };
        } else {
            return {};
        }
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
