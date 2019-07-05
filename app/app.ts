import { config } from 'dotenv';

config();   // run this before importing other modules

import "reflect-metadata";
import { Environment, Order, Service, ServiceDeployment } from '@entities';
import { Sequence } from '@entities';
import { SequenceRunner } from '@operators';
import { DeployerAnsible, Playbook } from '@ansible';
import { CliHelper } from '@utils';
import { FakeOrders } from '@fake';
import { Container } from '@core';
import { em, _EM_ } from '@decorators';
import { EntityManager } from 'typeorm';

export class App {
    readonly ready: Promise<any>;

    @em(_EM_.deployment)
    private em: EntityManager;

    constructor() {
        this.ready = Promise.all([
            this.initStdListeners(),
            this.initContainer()
        ]);
    }

    async createSequence(orderId: number): Promise<Sequence> {
        const o = new Order(FakeOrders[orderId]);
        await o.saveDeep();

        const s = new Sequence(o);
        return await s.saveDeep(this.em);
    }

    async runSequence(sequenceId: number): Promise<Sequence> {
        const runner = new SequenceRunner(sequenceId);

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
        const env = await this.em.getRepository(Environment).findOneOrFail(environmentUuid);

        const deployer = new DeployerAnsible(interactive);

        return await deployer.preparePlaybook(playbookReference, env);
    }

    async loadServicePlaybook(playbookReference: string, serviceUuid: string, interactive: boolean = false): Promise<Playbook> {
        const service = await this.em.getRepository(Service).findOneOrFail(serviceUuid);
        const deployment = await this.em.getRepository(ServiceDeployment).findOneOrFail({where: {service}});

        const deployer = new DeployerAnsible(interactive);

        const playbook = await deployer.preparePlaybook(playbookReference, deployment.environment, deployment);

        const doExecute = await CliHelper.askConfirmation('Execute playbook ?', false);

        if(doExecute) {
            await playbook.execute();
        }

        return playbook;
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
