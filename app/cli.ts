import * as program from 'commander';
import { Main } from '../src/main';
import { CustomOrders } from '@config';
import { ModeLoader } from '../src/core/mode/cli-mode-loader';
import { CliAnsibleHandler } from './lib/cli/cli-ansible';
import { CliTestHandler } from './lib/cli/cli-test-handler';
import { CliExampleDisplayHandler } from './lib/cli/cli-example-display-handler';
import { CliOrderHandler } from './lib/cli/cli-order-handler';
import { CliActionDropEnvironment } from './lib/cli/cli-action-drop-environment';
import { CliPushOrderHandler } from './lib/cli/cli-push-order-handler';

program
    .version('0.1.0')
    .option('--mode [mode]', 'Environment type (prod, test, local)')
    .option('--test', 'What your do for testing')
    .option('--ansible', 'Prepare ansible playbook')
    .option('--introspection', 'App introspection')
    .option('--playbook [playbookName]', 'Specify ansible playbook name')
    .option('-X, --execute', 'Combined with --ansible, executes the freshly created playbook')
    .option('-i, --interactive', 'Creates a sequence from order')
    .option('--order [orderId]', 'Creates a sequence from order')
    .option('--pushOrder [orderId]', 'Pushes an order to SQS queue')
    .option('--sequence [sequenceId]', 'Runs a sequence')
    .option('--environment [environmentId]', 'Environment Id')
    .option('--service [serviceId]', 'Service Id')
    .option('--drop', 'Associated with environment id, will drop deployment')
    .parse(process.argv);

ModeLoader(program);

const app = new Main();

app.ready.then(() => {
    if (program.test || program.testMore) {
        return CliTestHandler(program, app).then(() => app.exit());
    } else if (program.introspection) {
        console.log('introspection');
        return app.introspection().then(introspection => (console.log(introspection), app.exit()));
    } else if (program.pushOrder) {
        return CliPushOrderHandler(program.pushOrder).then(() => app.exit());
    } else if (program.order) {
        return CliOrderHandler(CustomOrders[parseInt(program.order)], app);
    } else if (program.ansible) {
        return CliAnsibleHandler(program, app);
    } else if (program.drop) {
        return CliActionDropEnvironment(program.environment, app);
    } else {
        return CliExampleDisplayHandler(program, app).then(() => app.exit());
    }
}).catch(err => {
    console.log('----- error catch end');
    console.log(err);
    throw err;
});
