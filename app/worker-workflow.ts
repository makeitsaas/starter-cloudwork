// something that will be able to handle workflow queues
import { Main } from '../src/main';
import { PipelineModule } from '../src/domains/pipeline/pipeline.module';

const app = new Main();

app.ready.then(() => {
    const pipelineModule = new PipelineModule();
    return pipelineModule.startWorker();
}).catch(err => {
    console.log('error\n', err);
});
