import { ExecutionResult, StepBody, StepExecutionContext } from 'workflow-es';
import { FakeDelay } from '@fake';
import { entityManager, IEnvironmentService, InjectedEM, TYPES } from '@decorators';
import { Environment } from '../../deployment/entities/environment';
import { injectable, inject } from "inversify";
import { Smoothie } from '../../../../app/test-ninja';
import { EntityManager } from 'typeorm';

// @injectable()
export class HelloWorldTask extends StepBody {

    @inject(Smoothie)
    private smoothie: Smoothie;

    @entityManager
    public em: InjectedEM;

    @inject(EntityManager)
    private myInjectedEm: EntityManager;

    // @inject(TYPES.IEnvironmentService)
    // private environmentService: IEnvironmentService;

    public someData: any;
    public run(context: StepExecutionContext): Promise<ExecutionResult> {
        console.log("Hello World");
        console.log(this.smoothie.drink());
        // this.environmentService.doSomething();
        return this.myInjectedEm.getRepository(Environment).find()
            .then(results => console.log('there is results', results))
            .then(() => FakeDelay.wait(5000))
            .then(() => ExecutionResult.next());
    }
}
