import { ExecutionResult, StepBody, StepExecutionContext } from 'workflow-es';
import { EntityManager } from 'typeorm';

import { em, _EM_, service } from '@decorators';
import { Order, Environment } from '@entities';
import { EnvironmentService, OrderService } from '@services';

export class EnvironmentUpdateConfigurationTask extends StepBody {

    // inputs
    public orderId: string;

    @em(_EM_.deployment)
    public em: EntityManager;

    @service
    private environmentService: EnvironmentService;

    @service
    private orderService: OrderService;

    private context: {
        order: Order
        environment: Environment
    };

    public run(context: StepExecutionContext): Promise<ExecutionResult> {
        console.log("EnvironmentUpdateConfigurationTask");
        return this.loadContext()
            .then(() => {
                console.log(`  > order(${this.context.order.id}) \n  > environment(${this.context.environment.uuid})`);
                this.context.environment.configuration = {
                    domains: this.context.order.getDomains()
                };
                return this.em.save(this.context.environment);
            })
            .then(() => {
                return ExecutionResult.next()
            });
    }

    private loadContext() {
        let order: Order, environment: Environment;
        return this.orderService.getOrderById(this.orderId)
            .then(o => {
                order = o;
            })
            .then(() => {
                environment = order.environment;
                if (!environment) {
                    throw new Error('Environment required (order.environment is null)');
                }
            })
            .then(() => {
                this.context = {
                    order,
                    environment
                };
            })
    }
}
