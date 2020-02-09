// import { _EM_, em } from '@decorators';
// import { EntityManager } from 'typeorm';

export class ExampleService {
    // @em(_EM_.deployment)
    // private em: EntityManager;

    async doSomething(): Promise<void> {
        console.log('something done');
    }
}
