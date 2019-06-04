import {
    EnvironmentVault,
    Order,
    Sequence,
    Service,
    ServiceDeployment, ServiceOperator,
    ServiceSpecification,
    Session
} from '@entities';

export class SequenceOperator {
    // primary check
    requiredServices: ServiceSpecification[];    // all the services we shall have in the end
    deployedServices: ServiceDeployment[];    // all the services that are currently deployed

    servicesCreations: ServiceOperator[];
    servicesUpdates: ServiceOperator[];
    servicesDeletions: ServiceOperator[];

    constructor(
        readonly session: Session,
        readonly environmentUuid: string,
        private sequence: Sequence,
        private order: Order,
        private vault: EnvironmentVault
    ) {
    }

    async prepare() {
        this.requiredServices = this.order.getServices();
        this.deployedServices = await this.session.infrastructure.getDeployedServices(this.environmentUuid);
        await this.preCheckServices();
    }

    private async preCheckServices() {
        console.log(`there is ${this.requiredServices.length} services and already ${this.deployedServices.length} deployments`);
        const createList = this.requiredServices.filter(serviceSpec => !this.isServiceDeployed(serviceSpec));
        this.servicesCreations = createList.map(serviceSpec => new ServiceOperator(
            this.session,
            'create',
            serviceSpec,
            undefined
        ));

        const updateList = this.requiredServices.filter(serviceSpec => this.isServiceDeployed(serviceSpec));
        this.servicesUpdates = updateList.map(serviceSpec => new ServiceOperator(
            this.session,
            'update',
            serviceSpec,
            this.getServiceDeployment(serviceSpec.uuid)
        ));

        const deleteList = this.deployedServices.filter(deployment => this.isDeploymentStillRequired(deployment));
        this.servicesDeletions = deleteList.map(deployment => new ServiceOperator(
            this.session,
            'delete',
            undefined,
            deployment
        ));

        console.log(`> servicesCreateDeployment = ${this.servicesCreations.length}`);
        console.log(`> servicesUpdateDeployment = ${this.servicesUpdates.length}`);
        console.log(`> servicesDeleteDeployment = ${this.servicesDeletions.length}`);
    }

    private isServiceDeployed(service: ServiceSpecification): boolean {
        console.log('is it deployed', service);
        return !!this.getServiceDeployment(service.uuid);
    }

    private isDeploymentStillRequired(deployment: ServiceDeployment) {
        console.log('is it still required', deployment);
        const match = this.requiredServices.filter(service => deployment.service.uuid === service.uuid);
        return match.length > 0;
    }

    private getServiceDeployment(serviceUuid: string): ServiceDeployment|void {
        const match = this.deployedServices.filter(deployment => deployment.service.uuid === serviceUuid);
        return match[0];
    }

}
