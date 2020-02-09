import {
    Environment,
    ServiceDeployment,
} from '@entities';
import { em, _EM_, service } from '@decorators';
import { EntityManager } from 'typeorm';
import { AnsibleService, Playbook } from '@ansible';

export class ExamplePlaybook {
    ready: Promise<any>;
    private deployment: ServiceDeployment;
    private environment: Environment;

    @em(_EM_.deployment)
    private em: EntityManager;

    @service
    private ansibleService: AnsibleService;

    constructor(
    ) {
        this.ready = (async () => {
        })();
    }

    /*
     * ---------------
     * Private methods
     * ---------------
     */

    private async doSomething(): Promise<Playbook | void> {
        const playbook = await this.ansibleService.preparePlaybook('playbook-name', this.environment, this.deployment);
        await playbook.execute();
        return playbook;
    }
}
