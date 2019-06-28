import { ExecutionResult, StepBody, StepExecutionContext } from 'workflow-es';

export class GoodbyeWorldTask extends StepBody {
    public run(context: StepExecutionContext): Promise<ExecutionResult> {
        console.log("Goodbye World");
        return ExecutionResult.next();
    }
}
