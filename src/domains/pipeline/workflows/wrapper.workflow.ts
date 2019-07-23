import {
    ExecutionResult, IWorkflowRegistry,
    StepBody,
    StepExecutionContext, TYPES,
    WorkflowBase,
    WorkflowBuilder,
} from 'workflow-es';
import { UpdateServiceWorkflow } from './update-service.workflow';
import { inject } from 'inversify';

class HelloWorld extends StepBody {
    public run(context: StepExecutionContext): Promise<ExecutionResult> {
        console.log("I am a wrapper");
        return ExecutionResult.next();
    }
}

export class WrapperWorkflow implements WorkflowBase<any> {
    public id: string = "wrapper-workflow";
    public version: number = 1;

    @inject(TYPES.IWorkflowRegistry)
    private registry : IWorkflowRegistry;

    public build(builder: WorkflowBuilder<any>) {
        let subWorkflow = new UpdateServiceWorkflow();
        // let subWorkflow = this.registry.getDefinition('update-service-workflow', 1);
        builder
            .startWith(HelloWorld)
            .foreach(data => {
                data.truc = 'muche';
                return [1, 2, 3];
            })
            .do((then: WorkflowBuilder<any>) => {
                subWorkflow.build(then);
            });
    }
}
