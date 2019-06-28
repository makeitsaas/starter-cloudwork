import { ExecutionResult, StepBody, StepExecutionContext } from 'workflow-es';
import { FakeDelay } from '@fake';

export class HelloWorldTask extends StepBody {
    public someData: any;
    public run(context: StepExecutionContext): Promise<ExecutionResult> {
        console.log("Hello World");
        return FakeDelay.wait(5000).then(() => ExecutionResult.next());
    }
}
