// something that will be able to handle workflow queues
import { Main } from '../src/main';
import { ExampleModule } from '../src/domains/example/example.module';

const app = new Main();

app.ready.then(() => {
    const exampleModule = new ExampleModule();
    return exampleModule.doSomethingSimple();
}).catch(err => {
    console.log('error\n', err);
});
