import {
    Environment,
    EnvironmentVault,
    Order,
    Sequence,
    ServiceDeployment, ServiceOperator,
    ServiceSpecification,
    Session
} from '@entities';

export class SequenceOperator {
    // primary check
    requiredServices: ServiceSpecification[];    // all the services we shall have in the end
    deployedServices: ServiceDeployment[];    // all the services that are currently deployed

    servicesToDeploy: ServiceOperator[];
    servicesToDrop: ServiceOperator[];

    constructor(
        readonly session: Session,
        readonly environment: Environment,
        private sequence: Sequence,
        private order: Order,
        private vault: EnvironmentVault
    ) {
    }

    async prepare() {
        this.requiredServices = this.order.getServices();
        this.deployedServices = await this.session.infrastructure.getDeployedServices(this.environment);
        await this.preCheckServices();
    }

    /*
     * ---------------
     * Public methods
     * ---------------
     */

    async launchAllocations() {
        // create deployment with 'to do' status and assign servers and port
        for (let i in this.servicesToDeploy) {
            let operator = this.servicesToDeploy[i];
            await operator.allocate();
        }
    }

    async launchVaultsSetup() {
        // configure required environment variables
        for (let i in this.servicesToDeploy) {
            let operator = this.servicesToDeploy[i];
            await operator.registerVaultValues(this.vault);
        }
    }

    async launchServicesSetup() {
        console.log('compute scripts');
        for (let i in this.servicesToDeploy) {
            let operator = this.servicesToDeploy[i];
            await operator.deploy();
        }
    }

    async launchServicesDrop() {
        console.log('drop scripts');
    }

    async launchProxyRefresh() {
        console.log('proxy update scripts');
    }

    async launchProxyDrop() {
        console.log('proxy drop scripts');
    }

    async launchCleanup() {
        console.log('cleanup scripts');
        for (let i in this.servicesToDeploy) {
            let operator = this.servicesToDeploy[i];
            await operator.cleanup();
        }
        for (let i in this.servicesToDrop) {
            let operator = this.servicesToDrop[i];
            await operator.dropDeployment();
        }
    }

    /*
     * ---------------
     * Private methods
     * ---------------
     */

    private async preCheckServices() {
        console.log(`there is ${this.requiredServices.length} services and already ${this.deployedServices.length} deployments`);

        this.servicesToDeploy = this.requiredServices.map(serviceSpec => new ServiceOperator(
            this.session,
            this.environment,
            'update',
            serviceSpec,
            this.getServiceDeployment(serviceSpec.uuid)
        ));

        const deleteList = this.deployedServices.filter(deployment => !this.isDeploymentStillRequired(deployment));
        this.servicesToDrop = deleteList.map(deployment => new ServiceOperator(
            this.session,
            this.environment,
            'delete',
            undefined,
            deployment
        ));

        console.log(`> servicesToDeploy = ${this.servicesToDeploy.length}`);
        console.log(`> servicesToDrop = ${this.servicesToDrop.length}`);
    }

    private isDeploymentStillRequired(deployment: ServiceDeployment) {
        console.log('is it still required', deployment);
        const match = this.requiredServices.filter(service => deployment.service.uuid === service.uuid);
        return match.length > 0;
    }

    private getServiceDeployment(serviceUuid: string): ServiceDeployment | void {
        const match = this.deployedServices.filter(deployment => deployment.service.uuid === serviceUuid);
        return match[0];
    }

}
