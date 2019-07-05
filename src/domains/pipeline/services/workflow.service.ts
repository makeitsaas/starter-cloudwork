import { IWorkflowHost } from 'workflow-es';
import { Order } from '@entities';

export class WorkflowService {
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
        let id = await this.host.startWorkflow("update-environment-workflow", 1, {
            orderId: order.id
        });
        console.log('started workflow id:', id);
    }
}
