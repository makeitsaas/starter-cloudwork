import { configureWorkflow, IWorkflowHost, WorkflowConfig, IWorkflowRegistry } from 'workflow-es';
import { workflowPersistenceLoader } from '@databases';
import { WorkflowService } from './services/workflow.service';
import { UpdateEnvironmentWorkflow } from './workflows/update-environment.workflow';
// import { Smoothie } from '../../../app/test-injectable';
// import { Container } from '@core';
// import { EntityManager } from 'typeorm';
import { Order } from './entities/order';
import { UpdateServiceWorkflow } from './workflows/update-service.workflow';
import { WrapperWorkflow } from './workflows/wrapper.workflow';
import { workflowLockLoader, workflowQueueLoader } from '../../core/queues/pipeline-lock';
import { TYPES, IPersistenceProvider, WorkflowStatus, WorkflowStepBase, ExecutionPointer } from 'workflow-es';


/**
 * TODO :
 * 1. inject full container
 * 2. configure container to load services
 * 3. migrate tasks from sequence operator
 * 4. cleanup testing code
 * 5. Créer un decorateur @service
 * 6. Refactoriser le decorateur @emDatabase en @em('database')
 */

export class PipelineModule {
    private workflowConfig: WorkflowConfig;
    private host: IWorkflowHost;
    readonly ready: Promise<any>;

    constructor() {
        this.ready = this.prepare();
    }

    private async prepare() {
        const config = configureWorkflow();
        //config.useLogger(new ConsoleLogger());
        config.usePersistence(await workflowPersistenceLoader());
        config.useLockManager(await workflowLockLoader());
        config.useQueueManager(await workflowQueueLoader());

        this.overloadWorkflowContainer(config);

        this.host = config.getHost();

        this.host.registerWorkflow(UpdateEnvironmentWorkflow);
        this.host.registerWorkflow(UpdateServiceWorkflow);
        this.host.registerWorkflow(WrapperWorkflow);
        this.workflowConfig = config;
    }

    async runDemo() {
        await this.ready;
        await this.host.publishEvent("myEvent", "0", "hello", new Date());
        const wfs = new WorkflowService(this.host);
        await this.host.start();
        return wfs.runDemo();
    }

    async processOrder(order: Order) {
        await this.ready;
        const wfs = new WorkflowService(this.host);
        // await this.host.start(); => register order workflow
        return wfs.processOrder(order);
    }

    async startWorker() {
        await this.ready;
        await this.host.start();
        console.log('---- new host ready (workflow worker)');

        return this.host;
    }

    async updateService() {
        await this.ready;
        const wfs = new WorkflowService(this.host);
        await this.host.start();
        return wfs.updateService();
    }

    async introspection(workflowId: string) {
        const {statusName, steps, pointers} = await this.getWorkflowProgress(workflowId);
        console.log("\n\n\n------- wf introspection", `status=${statusName}`);
        console.log(steps.map(step => `step(${step.id}): ${step.body.name}`));
        console.log(`execution pointers steps (${pointers.length}) :`);
        console.log(pointers.map((p, i) => `pointer n°${i} => step(${p.stepId})${p.active ? ' **active**' : ''}`));
        return {
            schema: true
        };
    }

    async getWorkflowProgress(workflowId: string): Promise<{status: number, statusName: string, steps: WorkflowStepBase[], pointers: ExecutionPointer[]}> {
        await this.ready;

        const container = await this.workflowConfig.getContainer();
        const persistence = container.get<IPersistenceProvider>(TYPES.IPersistenceProvider);
        const registry = container.get<IWorkflowRegistry>(TYPES.IWorkflowRegistry);

        const wf = await persistence.getWorkflowInstance(workflowId);
        const wfDefinition = await registry.getDefinition(wf.workflowDefinitionId, wf.version);

        return {
            status: wf.status,
            statusName: this.getWorkflowStatusKey(wf.status),
            steps: wfDefinition.steps,
            pointers: wf.executionPointers
        }
    }

    private getWorkflowStatusKey(value: number): string {
        const statuses: { [key: string]: number } = {...WorkflowStatus};
        for (let key in statuses) {
            if (statuses[key] === value) {
                return key
            }
        }

        return "unknown";
    }

    private overloadWorkflowContainer(config: WorkflowConfig) {
        // careful : here we use inversify v5.x while workflow-es uses v4.x
        const c = config.getContainer();
        // c.bind<Smoothie>(Smoothie).to(Smoothie);
        // c.bind(EntityManager).toConstantValue(Container.databases.main.manager);
    }
}
