import { configureWorkflow, IWorkflowHost, WorkflowConfig } from 'workflow-es';
import { workflowPersistenceLoader } from '@databases';
import { WorkflowService } from './services/workflow.service';
import { UpdateEnvironmentWorkflow } from './workflows/update-environment.workflow';
import { Smoothie } from '../../../app/test-ninja';
import { Container } from '@core';
import { EntityManager } from 'typeorm';

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

        this.overloadWFContainerBindings(config);

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

    private overloadWFContainerBindings(config: WorkflowConfig) {
        // careful : here we use inversify v5.x while workflow-es uses v4.x
        const c = config.getContainer();
        c.bind<Smoothie>(Smoothie).to(Smoothie);
        c.bind(EntityManager).toConstantValue(Container.databases.main.manager);
    }
}
