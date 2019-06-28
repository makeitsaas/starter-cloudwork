import { configureWorkflow, IWorkflowHost } from 'workflow-es';
import { workflowPersistenceLoader } from '@databases';
import { WorkflowService } from './services/workflow.service';
import { UpdateEnvironmentWorkflow } from './workflows/update-environment.workflow';

export class PipelineModule {
    private host: IWorkflowHost;
    readonly ready: Promise<any>;

    constructor() {
        this.ready = this.prepare();
    }

    private async prepare() {
        const config = configureWorkflow();
        //config.useLogger(new ConsoleLogger());
        config.usePersistence(await workflowPersistenceLoader());

        this.host = config.getHost();

        this.host.registerWorkflow(UpdateEnvironmentWorkflow);
    }

    async runDemo() {
        await this.ready;
        await this.host.publishEvent("myEvent", "0", "hello", new Date());
        const wfs = new WorkflowService(this.host);
        await this.host.start();
        return wfs.runDemo();
    }
}
