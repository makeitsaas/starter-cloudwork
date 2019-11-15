import { IWorkflowHost } from 'workflow-es';
import { Order } from '@entities';
import { service } from '../../../core/decorators/service-property';
import { InfrastructureService } from '../../infrastructure/services/infrastructure.service';

export class WorkflowService {

    @service
    private infrastructureService: InfrastructureService;

    constructor(
        private host: IWorkflowHost
    ) {}

    async runDemo(): Promise<string> {
        let id = await this.host.startWorkflow("update-environment-workflow", 1, {
            environmentId: "1234"
        });
        console.log('started workflow id:', id);

        return id;
    }

    async processOrder(order: Order) {
        console.log('WorkflowService.processOrder', order.id);
        const requiredServices = order.getServicesSpecifications();
        const deployedServices = await this.infrastructureService.getDeployedServices(order.environment);
        let id = await this.host.startWorkflow("update-environment-workflow", 1, {
            orderId: order.id,
            requiredServicesIds: requiredServices.map(s => s.uuid),
            deployedServicesIds: deployedServices.map(d => d.id),
        });
        console.log('started workflow id:', id);
    }

    async updateService() {
        let id = await this.host.startWorkflow("wrapper-workflow", 1, {});
        console.log('started workflow id:', id);
    }
}
