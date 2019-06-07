import { Environment, EnvironmentVault, Service, ServiceDeployment, ServiceSpecification, Session } from '@entities';
import { ServiceModel } from '../../../scheduler/models/service.model';

export class ServiceOperator {
    service: Service;
    serviceModel: ServiceModel;
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
            console.log(this.deployment);
            this.deployment.computingAllocation = await this.session.infrastructure.allocateDevComputing();
            await this.session.saveEntity(this.deployment);
        }

        if(!this.deployment.databaseAllocation) {
            this.deployment.databaseAllocation = await this.session.infrastructure.allocateDevDatabase();
            await this.session.saveEntity(this.deployment);
        }

    }

    async registerVaultValues(vault: EnvironmentVault) {
        if(this.specification) {
            console.log(`register vault values for service(${this.specification.uuid})`);
        }
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
        this.serviceModel = await this.session.load(ServiceModel);
        if(this.specification) {
            this.service = await this.serviceModel.getOrCreateService(this.specification.uuid);
        } else if(this.currentComputeDeployment) {
            this.service = this.currentComputeDeployment.service;
        } else {
            throw new Error("Missing information : either service specification or deployment");
        }
    }

    private async initDeployment() {
        if(!this.currentComputeDeployment) {
            this.deployment = await this.serviceModel.getOrCreateServiceDeployment(this.service, this.environment);
        } else {
            this.deployment = this.currentComputeDeployment;
        }
    }

    private async runDatabaseScript() {
        console.log('database script');
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
}
