import { ExecutionResult, StepBody, StepExecutionContext } from 'workflow-es';
import { FakeDelay } from '@fake';
import { entityManager, InjectedEM } from '@decorators';
import { Environment } from '../../deployment/entities/environment';

export class HelloWorldTask extends StepBody {
    @entityManager
    public em: InjectedEM;

    public someData: any;
    public run(context: StepExecutionContext): Promise<ExecutionResult> {
        console.log("Hello World");
        return this.em.getRepository(Environment)
            .then(repo => repo.find())
            .then(results => console.log('there is results', results))
            .then(() => FakeDelay.wait(5000))
            .then(() => ExecutionResult.next());
    }
}
