// Goal : push pipelines reports where needed

import { service } from '@decorators';
import { AwsOrdersTableProvider } from '@custom-modules/providers/aws';
import {
    ExecutionPointer,
    IPersistenceProvider,
    IWorkflowRegistry,
    TYPES,
    WorkflowConfig, WorkflowStatus,
    WorkflowStepBase
} from 'workflow-es';
import { OrderService } from './order.service';

export class ReportingService {

    private workflowConfig: WorkflowConfig;

    @service
    reportTableService: AwsOrdersTableProvider;

    @service
    orderService: OrderService;

    setWorkflowConfig(workflowConfig: WorkflowConfig) {
        this.workflowConfig = workflowConfig;
    }

    async buildReport(workflowUuid: string) {
        return this.getWorkflowProgress(workflowUuid);
    }

    async sendReport(orderUuid: string, report: any) {
        return this.reportTableService.updateReport(orderUuid, report);
    }

    async buildAndSendReport(workflowUuid: string) {
        const report = await this.buildReport(workflowUuid);
        const orderUuid = await this.getWorkflowOrderUuid(workflowUuid);
        return this.sendReport(orderUuid, report).then(() => report);
    }

    async getWorkflowInstance(workflowUuid: string) {
        const container = await this.workflowConfig.getContainer();
        const persistence = container.get<IPersistenceProvider>(TYPES.IPersistenceProvider);
        return persistence.getWorkflowInstance(workflowUuid);
    }

    async getWorkflowOrderUuid(workflowUuid: string): Promise<string> {
        const workflow = await this.getWorkflowInstance(workflowUuid);
        if(workflow.data.orderUuid) {
            return workflow.data.orderUuid;
        } else {
            const orderId = workflow.data.orderId;
            return await this.getOrderUuid(orderId);
        }
    }

    async getOrderUuid(orderId: number): Promise<string> {
        // ok, temporary two primary index due to recent orderUuid implementation
        return this.orderService.getOrderById(orderId).then(order => order.orderUuid);
    }

    async getWorkflowProgress(workflowId: string): Promise<{status: number, statusName: string, steps: WorkflowStepBase[], pointers: ExecutionPointer[]}> {
        const container = await this.workflowConfig.getContainer();
        const registry = container.get<IWorkflowRegistry>(TYPES.IWorkflowRegistry);

        const wf = await this.getWorkflowInstance(workflowId);
        const wfDefinition = await registry.getDefinition(wf.workflowDefinitionId, wf.version);

        return {
            status: wf.status,
            statusName: this.getWorkflowStatusKey(wf.status),
            steps: wfDefinition.steps,
            pointers: wf.executionPointers
        }
    }

    private getWorkflowStatusKey(value: number): string {
        const statuses: { [key: string]: number } = {...WorkflowStatus};
        for (let key in statuses) {
            if (statuses[key] === value) {
                return key
            }
        }

        return "unknown";
    }
}
