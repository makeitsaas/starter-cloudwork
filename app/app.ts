import { config } from 'dotenv';

config();   // run this before importing other modules

import "reflect-metadata";
import { Environment, Order, Service, ServiceDeployment } from '@entities';
import { Session } from '@session';
import { Sequence } from '@entities';
import { FakeOrders } from './fake/fake-orders';
import { SequenceRunner } from '@operators';
import { DeployerAnsible, Playbook } from '@ansible';
import { CliHelper } from '@utils';

export class App {
    readonly _session: Session;

    constructor() {
        this._session = new Session();
        this.initStdListeners();
    }

    async createSequence(orderId: number): Promise<Sequence> {
        const em = await this._session.em();

        const o = new Order(FakeOrders[orderId]);
        await o.saveDeep(em);

        const s = new Sequence(o);
        return await s.saveDeep(em);
    }

    async runSequence(sequenceId: number): Promise<Sequence> {
        const runner = new SequenceRunner(this._session, sequenceId);

        return await runner.runSequence();
    }

    async dropEnvironment(environmentUuid: string): Promise<number> {
        console.log('drop environment', environmentUuid);
        console.log('create drop order');
        console.log('create sequence for drop order');
        console.log('run drop order');
        console.log('data cleanup');

        return 200;
    }

    async loadPlaybook(playbookReference: string, environmentUuid: string, interactive: boolean = false): Promise<Playbook> {
        const em = await this._session.em();
        const env = await em.getRepository(Environment).findOneOrFail(environmentUuid);

        const deployer = new DeployerAnsible(this._session, interactive);

        return await deployer.preparePlaybook(playbookReference, env);
    }

    async loadServicePlaybook(playbookReference: string, serviceUuid: string, interactive: boolean = false): Promise<Playbook> {
        const em = await this._session.em();
        const service = await em.getRepository(Service).findOneOrFail(serviceUuid);
        const deployment = await em.getRepository(ServiceDeployment).findOneOrFail({where: {service}});

        const deployer = new DeployerAnsible(this._session, interactive);

        const playbook = await deployer.preparePlaybook(playbookReference, deployment.environment, deployment);

        const doExecute = await CliHelper.askConfirmation('Execute playbook ?', false);

        if(doExecute) {
            await playbook.execute();
        }

        return playbook;
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
