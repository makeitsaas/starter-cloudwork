import { TaskCheckResult } from '@utils';
import { ServiceOperator } from '@operators';
import { FakeDelay } from '@fake';
import { ExampleMethodDecorator } from '../decorators/example-method-decorator';
import { ExampleClassDecorator } from '../decorators/example-class-decorator';

// https://codeburst.io/decorate-your-code-with-typescript-decorators-5be4a4ffecb4
// https://github.com/danielgerlag/workflow-es

function myDecorator() {
    return function(target: any, key:string, descriptor: PropertyDescriptor) {
        // console.log('myDecorator called', target, key);
        const method = descriptor.value;

        descriptor.value = async function(...args: any[]) {
            console.log('there is something added before');
            await FakeDelay.wait(2000);
            await method.apply(this, args);
        };

        return descriptor;
    }
}

@ExampleClassDecorator
export class DeployServiceTask {
    constructor(
        private operator?: ServiceOperator
    ) {
        console.log('constructor is executed');
    }

    async check(): Promise<TaskCheckResult> {
        return {
            canBeDone: true,
            requiresPreviousTasks: false
        };
    }

    async checkStatus(): Promise<any> {
        // tmp : after a timeout failure (started but task was never marked as ended), we might need to
        //          check which status is the more susceptible to be still running, done or not
        //          => might be renamed in "recoveryCleanUp", or rollback might be sufficient
    }

    async prepare(): Promise<any> {

    }

    @myDecorator()
    async pre(): Promise<any> {
        console.log('pre');
    }

    @ExampleMethodDecorator()
    async run() {
        console.log('run start');
        await this.pre();
        console.log('do something');
        await this.post();
    }

    async post(): Promise<any> {
        console.log('original post function');
    }

    async rollback(): Promise<any> {

    }
}
