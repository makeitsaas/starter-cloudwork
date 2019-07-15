import {
    Environment,
    ServiceDeployment
} from '@entities';
import { Playbook } from '@ansible';

export class AnsibleService {
    constructor(private interactive: boolean = false) {
    }

    async preparePlaybook(playbookReference: string, environment: Environment, deployment?: ServiceDeployment): Promise<Playbook> {
        const playbook = new Playbook(playbookReference, environment, deployment, this.interactive);
        await playbook.ready;
        return playbook;
    }

}
