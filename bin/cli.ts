import { App } from '../app/app';

import * as program from 'commander';

program
    .version('0.1.0')
    .option('--order [orderId]', 'Creates a sequence from order')
    .option('--sequence [sequenceId]', 'Runs a sequence')
    .option('--environment [environmentId]', 'Environment Id')
    .option('--drop', 'Associated with environment id, will drop deployment')
    .parse(process.argv);

const app = new App();


// maybe add below a script to prepare ansible folder
// maybe add below a script to display operations that needs to be led

if (program.drop) {
    const environmentUuid = program.environment;

    if(!environmentUuid) {
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
