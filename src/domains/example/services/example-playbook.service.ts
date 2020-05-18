// DEPRECATED
import {
    Environment,
    ServiceDeployment,
} from '@entities';
import { em, _EM_, service } from '@decorators';
import { EntityManager } from 'typeorm';
import { Playbook } from '@ansible';

export class ExamplePlaybook {
    ready: Promise<any>;
    private deployment: ServiceDeployment;
    private environment: Environment;

    @em(_EM_.deployment)
    private em: EntityManager;

    // @service
    // private ansibleService: AnsibleService;

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
        const playbook = new Playbook(
            'playbooks/hello-world.yml',
            {},
            {dynamic_hosts: []});
        await playbook.setupDirectory();
        return await playbook.execute();
    }
}
