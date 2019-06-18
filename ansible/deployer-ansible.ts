import {
    Environment,
    ServiceDeployment,
    Session
} from '@entities';
import { Playbook } from './playbook';

export class DeployerAnsible {
    constructor(private session: Session, private interactive: boolean) {
    }

    async preparePlaybook(playbookReference: string, environment: Environment, deployment?: ServiceDeployment): Promise<Playbook> {
        const playbook = new Playbook(playbookReference, environment, deployment, this.interactive);
        await playbook.ready;

        return playbook;
    }
}
