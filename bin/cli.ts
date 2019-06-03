import { App } from '../app/app';

import * as program from 'commander';

program
    .version('0.1.0')
    .option('--sequence [sequenceId]', 'Runs a sequence')
    .parse(process.argv);

const app = new App();

if(program.sequence) {
    console.log('program.sequence =', program.sequence);

    app.runSequence(parseInt(program.sequence)).then(() => {
        app.exit();
    });
} else {
    console.log('nothing to do');
    app.exit();
}

