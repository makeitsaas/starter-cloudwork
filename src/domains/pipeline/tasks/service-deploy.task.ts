import { ExecutionResult, StepBody, StepExecutionContext } from 'workflow-es';
import { em, _EM_, service } from '@decorators';
import { EntityManager } from 'typeorm';
import { Environment, Order, ServiceDeployment, ServiceSpecification } from '@entities';
import { InfrastructureService, OrderService } from '@services';
import { ServiceOperator } from '../../deployment/value-objects/service-operator';

export class ServiceDeployTask extends StepBody {

    // inputs
    serviceUuid: string;
    orderId: string;

    @em(_EM_.deployment)
    public em: EntityManager;

    @service
    orderService: OrderService;

    @service
    infrastructureService: InfrastructureService;

    private context: {
        order: Order
        serviceSpecification: ServiceSpecification
        serviceOperator: ServiceOperator
    };

    public run(context: StepExecutionContext): Promise<ExecutionResult> {
        this.serviceUuid = context.item;
        this.checkInputs();

        return this.loadContext()
            .then(() => this.context.serviceOperator.deploy())
            .then(() => this.context.serviceOperator.updatePath())  // maybe somewhere else
            .catch(e => {
                console.log('[TASK ERROR] deploy error', e);
                throw e;
            })
            .then(() => ExecutionResult.next());
    }

    private checkInputs() {
        console.log(`ServiceDeployTask(${this.serviceUuid})`);

        if(!this.orderId) {
            throw new Error("Missing orderId");
        }
    }

    private async loadContext() {
        let order: Order = await this.orderService.getOrderById(this.orderId);
        let serviceSpecification: ServiceSpecification|void = await order.getServiceSpecificationByUuid(this.serviceUuid);
        let deployment: ServiceDeployment = await this.getDeployment(order.environment, this.serviceUuid);
        let serviceOperator: ServiceOperator = new ServiceOperator(
            order.environment,
            'update',
            serviceSpecification,
            deployment
        );
        if(order && serviceSpecification) {
            this.context = {
                order,
                serviceSpecification,
                serviceOperator
            }
        } else {
            throw new Error('Missing order or serviceSpecification');
        }
    }

    private async getDeployment(environment: Environment, serviceUuid: string) {
        let deployments = await this.infrastructureService.getDeployedServices(environment);
        const match = deployments.filter(deployment => deployment.service.uuid === serviceUuid);
        return match[0];
    }
}
