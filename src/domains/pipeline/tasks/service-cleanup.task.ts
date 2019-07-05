import { ExecutionResult, StepBody, StepExecutionContext } from 'workflow-es';
import { em, _EM_ } from '@decorators';
import { EntityManager } from 'typeorm';

export class ServiceCleanupTask extends StepBody {

    @em(_EM_.deployment)
    public em: EntityManager;

    public someData: any;
    public run(context: StepExecutionContext): Promise<ExecutionResult> {
        console.log("ServiceCleanupTask");
        return ExecutionResult.next();
    }
}
