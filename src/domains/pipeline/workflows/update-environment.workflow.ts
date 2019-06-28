import { WorkflowBase, WorkflowBuilder } from 'workflow-es';
import { HelloWorldTask } from '../tasks/hello-world.task';
import { GoodbyeWorldTask } from '../tasks/goodbye-world.task';

export class UpdateEnvironmentWorkflow implements WorkflowBase<any> {
    public id: string = "update-environment-workflow";
    public version: number = 1;

    public build(builder: WorkflowBuilder<any>) {
        builder
            .startWith(HelloWorldTask)
            .input((step, data) => {
                // step => StepClass instance
                // data => workflow-level data, stored in mongodb
                step.someData = data;
            })
            .then(GoodbyeWorldTask);
    }
}
