import { config } from 'dotenv';

config();   // run this before importing other modules

import "reflect-metadata";
import { Session } from '@entities';
import { SequenceRunner } from './scheduler/lib/sequence-runner';
import { Sequence } from '@entities';

const session = new Session();
const runner = new SequenceRunner(session);

runner.runSequence(28).then((seq: Sequence) => {
    // console.log(seq);
});

const exitHandler = () => {
    session.cleanup().then(code => {
        // code -1 : cleanup already in progress
        if (code !== -1) {
            process.exit(0);
        }
    });
};

process.stdin.resume();
//do something when app is closing
process.on('exit', exitHandler.bind(null, {cleanup: true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit: true}));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, {exit: true}));
process.on('SIGUSR2', exitHandler.bind(null, {exit: true}));

