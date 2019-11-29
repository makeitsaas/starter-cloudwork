import { ExecutionResult, StepBody, StepExecutionContext } from 'workflow-es';
import { em, _EM_, service } from '@decorators';
import { EntityManager } from 'typeorm';
import { Order } from '@entities';
import { OrderService } from '@services';
import { AnsibleService } from '@ansible';
import { DatabaseDeploymentFailed, ProxyReloadFailed } from '../../deployment/errors';
import { ReportingService } from '../services/reporting.service';

export class ProxyReloadTask extends StepBody {

    // inputs
    orderId: string;

    @em(_EM_.deployment)
    public em: EntityManager;

    @service
    orderService: OrderService;

    @service
    private ansibleService: AnsibleService;

    @service
    reportingService: ReportingService;

    private context: {
        order: Order
    };

    public run(context: StepExecutionContext): Promise<ExecutionResult> {
        console.log("ProxyReloadTask");
        this.reportingService.buildAndSendReport(context.workflow.id);
        return this.loadContext()
            .then(async () => {
                const playbook = await this.ansibleService.preparePlaybook('proxy-reload', this.context.order.environment);
                try {
                    await playbook.execute();
                } catch (e) {
                    throw new ProxyReloadFailed('Proxy refresh failed');
                }
            })
            .then(() => ExecutionResult.next());
    }

    private async loadContext() {
        let order: Order = await this.orderService.getOrderById(this.orderId);
        if (order) {
            this.context = {
                order
            }
        } else {
            throw new Error('Missing order or serviceSpecification');
        }
    }
}
