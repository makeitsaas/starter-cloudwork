import { Environment, EnvironmentVault } from '@entities';
import {
    AnsibleExecutionClient, AnsibleInventoryInterface,
    AnsibleVarsInterface
} from './modules/ansible-execution-client/ansible-execution-client';
import { CliHelper } from '../app/scheduler/lib/cli-helper';

export class Playbook {

    readonly ready: Promise<any>;
    private executionClient: AnsibleExecutionClient;
    private vars: AnsibleVarsInterface;
    private inventory: AnsibleInventoryInterface;

    constructor(
        private environment: Environment,
        private name: string,
        private interactive: boolean
    ) {
        this.ready = Promise.all([
            this.loadVars(),
            this.loadInventory()
        ]).then(() => {
            this.executionClient = new AnsibleExecutionClient(this.vars, this.inventory, this.name);
        })
    }

    async loadVars(): Promise<AnsibleVarsInterface> {
        // get expected values, either from vault or ask user ! ! !
        const vault = await this.getVault();
        const required = this.getRequiredValues();
        const lastInteractiveValues = await this.getLastInteractiveValues();
        const vars: AnsibleVarsInterface = {};

        for (let i in required) {
            let key = required[i];
            if (vault.getValue(key)) {
                vars[key] = vault.getValue(key);
            } else if (this.interactive) {
                if (lastInteractiveValues && lastInteractiveValues[key]) {
                    vars[key] = lastInteractiveValues[key];
                } else {
                    let interactiveValue = await CliHelper.askInteractively(key);
                    await this.saveInteractiveValue(key, interactiveValue);
                    vars[key] = interactiveValue;
                }
            }
        }

        this.vars = vars;

        return vars;
    }

    async loadInventory(): Promise<AnsibleInventoryInterface> {
        // get expected values
        // get from vault, and if missing, ask user ! ! !
        this.inventory = {};
        return {};
    }

    async getVault(): Promise<EnvironmentVault> {
        return new EnvironmentVault();
    }

    getRequiredValues(): string[] {
        return [
            'environment_domain',
            'repo_url',
            'repo_directory',
            'redis_hostname',
            'db_hostname',
            'db_database',
            'db_username',
            'db_password',
            'service_port'
        ]
    }

    async getLastInteractiveValues(): Promise<AnsibleVarsInterface> {
        return {};
    }

    async saveInteractiveValue(key: string, value: string) {
        console.log('save', key, '=>', value);
    }

    async execute() {
        await this.ready;
        await this.executionClient.prepare();
        console.log('we can execute now');
    }
}

export class DeployerAnsible {

    constructor(private interactive: boolean) {
    }

    async preparePlaybook(environment: Environment, playbookReference: string): Promise<Playbook> {
        return new Playbook(environment, playbookReference, this.interactive);
    }

    async executePlaybook(playbook: Playbook) {
        return playbook.execute();
    }
}
