import '@configure-once';
import { Container } from '@core';

export class Main {
    readonly ready: Promise<any>;

    constructor() {
        this.ready = Promise.all([
            this.initStdListeners(),
            this.initContainer()
        ]);
    }

    exitHandler() {
        process.exit(0);
    }

    async initStdListeners() {
        process.stdin.resume();
        //do something when app is closing
        process.on('exit', this.exitHandler.bind(this, {cleanup: true}));

        //catches ctrl+c event
        process.on('SIGINT', this.exitHandler.bind(this, {exit: true}));

        // catches "kill pid" (for example: nodemon restart)
        process.on('SIGUSR1', this.exitHandler.bind(this, {exit: true}));
        process.on('SIGUSR2', this.exitHandler.bind(this, {exit: true}));
    }

    async initContainer() {
        return Container.ready;
    }

    exit() {
        this.exitHandler();
    }
}
