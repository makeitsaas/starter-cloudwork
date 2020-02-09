import { service } from '@decorators';
import { ExampleService } from './services/example.service';

export class ExampleModule {
    readonly ready: Promise<any>;

    @service
    exampleService: ExampleService;

    constructor() {
        this.ready = this.prepare();
    }

    private async prepare() {
        console.log('prepare');
    }

    async doSomethingSimple() {
        return this.exampleService.doSomething();
    }

    async doSomethingWithPlaybook() {
        // return this.exampleService.doSomething();
    }

}
