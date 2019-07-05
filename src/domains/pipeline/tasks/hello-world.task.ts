import { ExecutionResult, StepBody, StepExecutionContext } from 'workflow-es';
import { FakeDelay } from '@fake';
import { em, _EM_ } from '@decorators';
import { Environment } from '@entities';
import { inject } from "inversify";
import { Smoothie } from '../../../../app/test-ninja';
import { EntityManager } from 'typeorm';

export class HelloWorldTask extends StepBody {

    @inject(Smoothie)
    private smoothie: Smoothie;

    @em(_EM_.deployment)
    public em: EntityManager;

    @inject(EntityManager)
    private myInjectedEm: EntityManager;

    public someData: any;
    public run(context: StepExecutionContext): Promise<ExecutionResult> {
        console.log("Hello World");
        console.log(this.smoothie.drink());
        // this.environmentService.doSomething();
        return this.myInjectedEm.getRepository(Environment).find()
            .then(results => console.log('there is results', results))
            .then(() => FakeDelay.wait(1000))
            .then(() => ExecutionResult.next());
    }
}
