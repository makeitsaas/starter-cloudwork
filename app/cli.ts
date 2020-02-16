import * as program from 'commander';
import { Main } from '../src/main';
import { ModeLoader } from '../src/core/mode/cli-mode-loader';
import { CliTestHandler } from './lib/cli/cli-test-handler';
import { CliCreateClusterHandler } from './lib/cli/cli-create-cluster-handler';

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
    } else {
        return CliCreateClusterHandler(program, app).then(() => app.exit());
    }
}).catch(err => {
    console.log('----- error catch end');
    console.log(err);
    throw err;
});
