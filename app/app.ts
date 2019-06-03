import { config } from 'dotenv';

config();   // run this before importing other modules

import "reflect-metadata";
import { Session } from '@entities';
import { SequenceRunner } from './scheduler/lib/sequence-runner';
import { Sequence } from '@entities';


export class App {
    private readonly _session: Session;

    constructor() {
        this._session = new Session();
        this.initStdListeners();
    }

    runSequence(sequenceId: number): Promise<Sequence> {
        const runner = new SequenceRunner(this._session);

        return runner.runSequence(sequenceId);
    }

    exitHandler() {
        this._session.cleanup().then(code => {
            // code -1 : cleanup already in progress
            if (code !== -1) {
                process.exit(0);
            }
        });
    }

    initStdListeners() {
        process.stdin.resume();
        //do something when app is closing
        process.on('exit', this.exitHandler.bind(this, {cleanup: true}));

        //catches ctrl+c event
        process.on('SIGINT', this.exitHandler.bind(this, {exit: true}));

        // catches "kill pid" (for example: nodemon restart)
        process.on('SIGUSR1', this.exitHandler.bind(this, {exit: true}));
        process.on('SIGUSR2', this.exitHandler.bind(this, {exit: true}));
    }

    exit() {
        this.exitHandler();
    }
}
