import { WorkflowHost, WorkflowBuilder, WorkflowBase, StepBody, StepExecutionContext, ExecutionResult, WorkflowInstance, configureWorkflow, ConsoleLogger } from "workflow-es";
import { MongoDBPersistence } from "workflow-es-mongodb";

class HelloWorld extends StepBody {
    public run(context: StepExecutionContext): Promise<ExecutionResult> {
        console.log("Hello World");
        return ExecutionResult.next();
    }
}

class GoodbyeWorld extends StepBody {
    public run(context: StepExecutionContext): Promise<ExecutionResult> {
        console.log("Goodbye World");
        return ExecutionResult.next();
    }
}

class HelloWorld_Workflow implements WorkflowBase<any> {
    public id: string = "hello-world";
    public version: number = 1;

    public build(builder: WorkflowBuilder<any>) {
        builder
            .startWith(HelloWorld)
            .then(GoodbyeWorld);
    }
}


class DeferredStep extends StepBody {
    public run(context: StepExecutionContext): Promise<ExecutionResult> {
        if (!context.persistenceData) {
            console.log("going to sleep...");
            return ExecutionResult.sleep(new Date(Date.now() + 20000), true);
        }
        else {
            console.log("waking up...");
            return ExecutionResult.next();
        }
    }
}

class DeferSample_Workflow implements WorkflowBase<any> {
    public id: string = "defer-sample";
    public version: number = 1;

    public build(builder: WorkflowBuilder<any>) {
        builder
            .startWith(DeferredStep)
            .thenRun(context => {
                console.log("done");
                return ExecutionResult.next();
            });
    }
}

export const WorkflowEsExample = {
    async run(): Promise<any> {
        console.log('run workflow-es');
        const config = configureWorkflow();
        //config.useLogger(new ConsoleLogger());
        let mongoPersistence = new MongoDBPersistence("mongodb://root:password@127.0.0.1:27017/workflow-node?authSource=admin");
        const info = await mongoPersistence.connect;
        console.log('info', info);
        config.usePersistence(mongoPersistence);

        const host = config.getHost();

        host.registerWorkflow(HelloWorld_Workflow);
        host.registerWorkflow(DeferSample_Workflow);
        await host.start();
        let id = await host.startWorkflow("defer-sample", 1, null);

        console.log("Started workflow: " + id);
    }
};
