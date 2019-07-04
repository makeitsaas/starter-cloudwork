import { Environment } from '../entities/environment';
import { em, _EM_ } from '@decorators';
import { EntityManager } from 'typeorm';

export class EnvironmentService {
    @em(_EM_.deployment)
    private em: EntityManager;

    async getOrCreateEnvironment(uuid: string): Promise<Environment> {
        const repo = await this.em.getRepository(Environment);
        const existingEnvironment: Environment|void = await repo.findOne(uuid);
        if(existingEnvironment) {
            return existingEnvironment;
        } else {
            let newEnvironment= new Environment();
            newEnvironment.uuid = uuid;
            await this.em.save(newEnvironment);
            return newEnvironment;
        }
    }

    doSomething() {
        console.log('SOMETHING DONE');
    }
}
