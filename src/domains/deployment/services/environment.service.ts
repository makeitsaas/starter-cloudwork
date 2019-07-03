import { Environment } from '../entities/environment';
import { entityManager, InjectedEM } from '@decorators';
import { injectable, inject } from "inversify";

export const TYPES = {
    IEnvironmentService: Symbol("IEnvironmentService")
};

export interface IEnvironmentService {
    getOrCreateEnvironment(uuid: string): Promise<Environment>
    doSomething(): void
}

@injectable()
export class EnvironmentService implements IEnvironmentService {
    @entityManager
    public em: InjectedEM;

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
