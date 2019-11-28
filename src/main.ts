import { config } from 'dotenv';

config();   // run this before importing other modules

import "reflect-metadata";
import { Environment, Order, Service, ServiceDeployment } from '@entities';
import { AnsibleService, Playbook } from '@ansible';
import { Container } from '@core';
import { em, _EM_, service } from '@decorators';
import { EntityManager } from 'typeorm';
import { PipelineModule } from './domains/pipeline/pipeline.module';
import { ModeLoader } from './core/mode/cli-mode-loader';

ModeLoader();

export class Main {
    readonly ready: Promise<any>;

    @service
    pipelineModule: PipelineModule;

    @em(_EM_.deployment)
    private em: EntityManager;

    constructor() {
        this.ready = Promise.all([
            this.initStdListeners(),
            this.initContainer()
        ]);
    }

    async handleYMLOrder(orderUuid: string, userUuid: string, ymlOrder: string): Promise<any> {
        console.log('yml order:', ymlOrder);
        const o = new Order(ymlOrder);
        o.orderUuid = orderUuid;
        o.userUuid = userUuid;
        return o.saveDeep().then(o => {
            return this.pipelineModule
                .processOrder(o)
        });
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

        const deployer = new AnsibleService(interactive);

        return await deployer.preparePlaybook(playbookReference, env);
    }

    async loadServicePlaybook(playbookReference: string, serviceUuid: string, interactive: boolean = false): Promise<Playbook> {
        const service = await this.em.getRepository(Service).findOneOrFail(serviceUuid);
        const deployment = await this.em.getRepository(ServiceDeployment).findOneOrFail({where: {service}});
        const deployer = new AnsibleService(interactive);

        return await deployer.preparePlaybook(playbookReference, deployment.environment, deployment);
    }

    async introspection() {
        // TODO : remove hardcoded id
        const workflowId = "5de04a7a18720413a0ecdc66";

        const report = await this.pipelineModule.report(workflowId);
        const wfIntrospection = await this.pipelineModule.introspection(workflowId);

        return {
            pipeline: wfIntrospection
        }
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
