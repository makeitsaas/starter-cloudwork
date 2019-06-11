import { App } from '../app/app';

import * as program from 'commander';
import { Playbook } from '../ansible/deployer-ansible';
import { CliHelper } from '../app/scheduler/lib/cli-helper';
import { ConfigReader } from '../app/scheduler/lib/config-reader';


program
    .version('0.1.0')
    .option('--ansible', 'Prepare ansible playbook')
    .option('--playbook [playbookName]', 'Specify ansible playbook name')
    .option('-X, --execute', 'Combined with --ansible, executes the freshly created playbook')
    .option('-i, --interactive', 'Creates a sequence from order')
    .option('--order [orderId]', 'Creates a sequence from order')
    .option('--sequence [sequenceId]', 'Runs a sequence')
    .option('--environment [environmentId]', 'Environment Id')
    .option('--drop', 'Associated with environment id, will drop deployment')
    .parse(process.argv);

const app = new App();

// maybe add below a script to display operations that needs to be led

if (program.ansible) {
    const getPlaybookReference = async (): Promise<string> => {
        if (program.playbook) {
            return program.playbook;
        } else {
            return await CliHelper.askList(ConfigReader.playbooks.getKeys());
        }
    };
    Promise.resolve(getPlaybookReference())
        .then((playbookReference: string) => {
            return app.loadServicePlaybook(playbookReference, '6', program.interactive)
                .then(async (playbook: Playbook) => {
                    if (program.execute) {
                        await playbook.execute();
                    } else {
                        console.log('\n\n\nSUCCESS ! Playbook has been created. Use commands below to execute it manually :\n');
                        console.log(`cd ${await playbook.getDirectory()}`);
                        console.log(`ansible-playbook -i inventories/hosts root-playbook.yml`);
                        console.log(`cd ../..\n\n`);
                    }
                    app.exit();
                });
        })
        .finally(() => {
            app.exit()
        });

} else if (program.drop) {
    const environmentUuid = program.environment;

    if (!environmentUuid) {
        console.error("You shall specify environment id");
    } else {
        app.dropEnvironment(environmentUuid).then(() => {
            app.exit();
        })
    }
} else if (program.sequence) {
    console.log('program.sequence =', program.sequence);
    app.runSequence(parseInt(program.sequence)).then(() => {
        app.exit();
    });
} else if (program.order) {
    console.log('program.order =', program.order);
    app.createSequence(parseInt(program.order)).then(() => {
        app.exit();
    });
} else {
    console.log('Example commands :\n\
npm run cli -- --order=1 \n\
npm run cli -- --sequence=35 \n\
npm run cli -- --drop --environment=1 \n\
    ');
    app.exit();
}
