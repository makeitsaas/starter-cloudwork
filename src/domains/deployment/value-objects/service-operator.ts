import {
    AbstractBaseVault,
    Environment,
    Service,
    ServiceDeployment,
    ServiceSpecification
} from '@entities';
import { Session } from '@session';
import { DeploymentService, VaultService } from '@services';

export class ServiceOperator {
    service: Service;
    serviceModel: DeploymentService;
    ready: Promise<any>;
    private deployment: ServiceDeployment;

    constructor(
        private session: Session,
        private environment: Environment,
        private action: string,
        private specification: ServiceSpecification|void,
        private currentComputeDeployment: ServiceDeployment|void
    ) {
        this.ready = (async () => {
            await this.initService();
            await this.initDeployment();

            if(!this.service || !this.deployment) {
                throw new Error("Could not initialize service operator properly");
            }
        })();
    }

    /*
     * ---------------
     * Public methods
     * ---------------
     */

    async allocate() {
        await this.ready;
        console.log('assigning servers and ports');

        if(!this.deployment.computingAllocation) {
            this.deployment.computingAllocation = Promise.resolve(await this.session.infrastructure.allocateDevComputing());
            await this.session.saveEntity(this.deployment);
        }

        const databaseAllocation = await this.deployment.databaseAllocation;
        if(!databaseAllocation) {
            this.deployment.databaseAllocation = this.session.infrastructure.allocateDevDatabase(); // TODO : pareil
            await this.session.saveEntity(this.deployment);
        }

    }

    async registerVaultValues(): Promise<any> {
        await this.ready;

        const vault = await VaultService.getDeploymentVault(`${this.deployment.id}`);

        let getters = this.vaultFieldsRequirementsGetters(vault);

        for(let key in getters) {
            let vaultValue = vault.getValue(key);

            if(!vaultValue) {
                const value = await getters[key].apply(this);
                console.log('vault add value', key, value);
                vault.addValue(key, value);
            } else {
                console.log('vault value already exists', vaultValue);
            }
        }

        await vault.save();
    }

    async deploy() {
        await this.runDatabaseScript();
        await this.runComputeScript();
        await this.runMigrationsScript();
    }

    async cleanup() {
        console.log('clean me');
    }

    async dropDeployment() {
        console.log('drop me');
    }

    /*
     * ---------------
     * Private methods
     * ---------------
     */

    private async initService() {
        this.serviceModel = await this.session.load(DeploymentService);
        if(this.specification) {
            this.service = await this.serviceModel.getOrCreateService(this.specification.uuid, this.specification.repositoryUrl);
        } else if(this.currentComputeDeployment) {
            this.service = this.currentComputeDeployment.service;
        } else {
            throw new Error("Missing information : either service specification or deployment");
        }
    }

    private async initDeployment() {
        if(!this.currentComputeDeployment) {
            if(!this.specification) {
                throw new Error('Missing specifications');
            }
            this.deployment = await this.serviceModel.getOrCreateServiceDeployment(this.service, this.environment, this.specification);
        } else {
            this.deployment = this.currentComputeDeployment;
        }
    }

    private async runDatabaseScript() {
        console.log('database script');
        await VaultService.getDeploymentVault(`${this.deployment.id}`);
    }

    private async runComputeScript() {
        console.log('compute script');
    }

    private async runMigrationsScript() {
        console.log('migration script');
    }

    private async runCleanupScript() {
        console.log('cleanup script');
    }

    private vaultFieldsRequirementsGetters(vault: AbstractBaseVault): {[id: string]: () => Promise<string>} {
        return {
            "DB_DATABASE": this.generateDatabaseName,
            "DB_USERNAME": this.generateDatabaseUserName,
            "DB_PASSWORD": this.passwordGenerator(),
            // "GITHUB_CLIENT_ID": this.getGithubSecret('client_id'),
            // "GITHUB_CLIENT_SECRET": this.getGithubSecret('client_secret'),
            // "GITHUB_CALLBACK_URL": this.getGithubSecret('callback_url'),
        };
    }

    private generateDatabaseName(): Promise<string> {
        console.log('this.deployment', this.deployment);
        return Promise.resolve(`db_d${this.deployment.id}`);
    }

    private generateDatabaseUserName(): Promise<string> {
        return Promise.resolve(`user_d${this.deployment.id}`);
    }

    private passwordGenerator(size: number|undefined = undefined): () => Promise<string> {
        return () => {
            return this.generatePassword(size);
        };
    }

    private generatePassword(size: number = 24): Promise<string> {
        const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-)(+[]!?&";
        let password = "";

        for(let i = 0; i < size; i++) {
            password += characters[Math.floor(Math.random() * characters.length)];
        }

        return Promise.resolve(password);
    }
}
