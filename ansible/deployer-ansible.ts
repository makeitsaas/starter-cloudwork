import {
    AbstractBaseVault,
    Environment,
    EnvironmentVault,
    ServiceDeployment,
    ServiceDeploymentVault,
    Session
} from '@entities';
import {
    AnsibleExecutionClient, AnsibleInventoryInterface,
    AnsibleVarsInterface
} from './modules/ansible-execution-client/ansible-execution-client';
import { CliHelper } from '../app/scheduler/lib/cli-helper';
import { ConfigReader, SinglePlaybookConfig } from '../app/scheduler/lib/config-reader';
import { VaultModel } from '@models';

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
        const vault = await this.getVault();

        for (let i in required) {
            let key = required[i];
            let vaultValue = vault.getValue(key);
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
        const vault = await this.getVault();
        vault.addValue(key, value);
        await vault.save();
    }

    private async getVault(): Promise<AbstractBaseVault> {
        return this.deploymentVault || this.vault;
    }
}

export class DeployerAnsible {
    constructor(private session: Session, private interactive: boolean) {
    }

    async preparePlaybook(playbookReference: string, environment: Environment, deployment?: ServiceDeployment): Promise<Playbook> {
        const environmentVault = await VaultModel.getEnvironmentVault(environment.uuid);
        const deploymentVault = deployment ? await VaultModel.getDeploymentVault(`${deployment.id}`) : undefined;
        const playbook = new Playbook(playbookReference, environment, environmentVault, deployment, deploymentVault, this.interactive);
        await playbook.ready;

        return playbook;
    }
}
