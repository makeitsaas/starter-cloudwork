import { EnvironmentVault, Order, Sequence, Service, ServiceDeployment, Session } from '@entities';

export class SequenceOperator {
    // primary check
    requiredServices: Service[];    // all the services we shall have in the end
    deployedServices: ServiceDeployment[];    // all the services that are currently deployed

    servicesCreateDeployment: Service[];
    servicesUpdateDeployment: Service[];
    servicesDeleteDeployment: ServiceDeployment[];

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
        this.servicesCreateDeployment = this.requiredServices.filter(service => !this.isServiceDeployed(service));
        this.servicesUpdateDeployment = this.requiredServices.filter(service => this.isServiceDeployed(service));
        this.servicesDeleteDeployment = this.deployedServices.filter(deployment => this.isDeploymentStillRequired(deployment));
        console.log(`> servicesCreateDeployment = ${this.servicesCreateDeployment.length}`);
        console.log(`> servicesUpdateDeployment = ${this.servicesUpdateDeployment.length}`);
        console.log(`> servicesDeleteDeployment = ${this.servicesDeleteDeployment.length}`);
    }

    private isServiceDeployed(service: Service) {
        console.log('is it deployed', service);
        const match = this.deployedServices.filter(deployment => deployment.service.uuid = service.uuid);
        return match.length > 0;
    }

    private isDeploymentStillRequired(deployment: ServiceDeployment) {
        console.log('is it still required', deployment);
        const match = this.requiredServices.filter(service => deployment.service.uuid = service.uuid);
        return match.length > 0;
    }

}
