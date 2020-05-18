import {
    WorkflowBuilder,
    WorkflowBase,
    StepBody,
    StepExecutionContext,
    ExecutionResult,
    configureWorkflow
} from "workflow-es";
import { FakeDelay } from '../src/shared/fake/fake-delay';

class SayHello extends StepBody {
    run(context: StepExecutionContext): Promise<ExecutionResult> {
        console.log("Hello");
        return ExecutionResult.next();
    }
}

class DisplayContextAndWait extends StepBody {
    run(context: StepExecutionContext): Promise<ExecutionResult> {
        console.log(`Working on ${context.item}`);
        if (!context.pointer.eventPublished) {
            let effDate: Date = new Date(2000, 1, 1);
            return ExecutionResult.waitForEvent("my-event", `data-value-${context.item}`, effDate);
        }

        console.log("event data", context.pointer.eventData);
        return ExecutionResult.next();
    }
}

class DoSomething extends StepBody {
    run(context: StepExecutionContext): Promise<ExecutionResult> {
        console.log("Doing something...");
        return ExecutionResult.next();
    }
}

class SayGoodbye extends StepBody {
    run(context: StepExecutionContext): Promise<ExecutionResult> {
        console.log("Bye");
        return ExecutionResult.next();
    }
}


class MyDataClass {
    public value1: number;
    public value2: number;
    public value3: number;
}


class Foreach_Workflow implements WorkflowBase<MyDataClass> {
    public id: string = "foreach-sample";
    public version: number = 1;

    public build(builder: WorkflowBuilder<MyDataClass>) {
        builder
            .startWith(SayHello)
            // .foreach((data) => ["one", "two", "three"])
            .foreach((data) => ["one", "two", "three"])
            .do(
                (then) => then
                    .startWith(DisplayContextAndWait)
                    .then(DoSomething)
            )
            .then(SayGoodbye);
    }
}

async function main() {
    var config = configureWorkflow();
    //config.useLogger(new ConsoleLogger());
    var host = config.getHost();

    host.registerWorkflow(Foreach_Workflow);
    await host.start();
    let id = await host.startWorkflow("foreach-sample", 1, {});
    console.log("Started workflow: " + id);

    await FakeDelay.wait(1000);
    await host.publishEvent("my-event", "data-value-two", "hi 2!", new Date());
    await FakeDelay.wait(1000);
    await host.publishEvent("my-event", "data-value-three", "hi 3!", new Date());
    await FakeDelay.wait(1000);
    await host.publishEvent("my-event", "data-value-one", "hi 1!", new Date());
}

main();
