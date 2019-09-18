import { Environment, Server } from '@entities';
import { em, _EM_, service } from '@decorators';
import { EntityManager } from 'typeorm';
import { InfrastructureService } from '@services';

export class EnvironmentService {
    @em(_EM_.deployment)
    private em: EntityManager;

    @service
    infrastructure: InfrastructureService;

    async getOrCreateEnvironment(uuid: string): Promise<Environment> {
        const repo = await this.em.getRepository(Environment);
        const existingEnvironment: Environment|void = await repo.findOne(uuid);
        if(existingEnvironment) {
            return existingEnvironment;
        } else {
            const newEnvironment= new Environment();
            const proxy: Server = await this.infrastructure.allocateProxy();
            newEnvironment.uuid = uuid;
            newEnvironment.proxy = Promise.resolve(proxy);
            await this.em.save(newEnvironment);
            return newEnvironment;
        }
    }

    doSomething() {
        console.log('SOMETHING DONE');
    }
}
