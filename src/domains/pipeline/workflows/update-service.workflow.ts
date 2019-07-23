import {
    ExecutionResult,
    StepBody,
    StepExecutionContext,
    WorkflowBase,
    WorkflowBuilder,
} from 'workflow-es';
import { ServiceDeployTask } from '../tasks/service-deploy.task';

class HelloWorld extends StepBody {
    public serviceId: any;
    public run(context: StepExecutionContext): Promise<ExecutionResult> {
        if(!this.serviceId) {
            this.serviceId = context.item;
        }
        console.log("Hello World", this.serviceId);
        return ExecutionResult.next();
    }
}

class GoodbyeWorld extends StepBody {
    public run(context: StepExecutionContext): Promise<ExecutionResult> {
        console.log("Goodbye mthrfckr");
        return ExecutionResult.next();
    }
}

export class UpdateServiceWorkflow implements WorkflowBase<any> {
    public id: string = "update-service-workflow";
    public version: number = 1;

    public build(builder: WorkflowBuilder<any>) {
        builder
            .startWith(HelloWorld)
            .then(ServiceDeployTask)
            .input((step, data) => {
                // console.log('step', step);
                console.log('data', data);
                if(data.orderId) {
                    step.orderId = data.orderId
                }
            })
            .then(GoodbyeWorld);
    }
}
