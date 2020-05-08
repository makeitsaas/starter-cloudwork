import {
    Environment,
    ServiceDeployment
} from '@entities';
import { IPlaybookInputObjects, Playbook } from '.';
// import { ConfigReader } from '@utils';
// import { service } from '@decorators';
// import { InfrastructureService } from '@services';

export class AnsibleService {
    // @service
    // infrastructure: InfrastructureService;

    constructor(private interactive: boolean = false) {
    }

    async preparePlaybook(playbookReference: string, environment: Environment, deployment?: ServiceDeployment): Promise<Playbook> {
        let inputs: IPlaybookInputObjects = {environment, deployment};

        // if(ConfigReader.playbooks.doesPlaybookRequireLambdaServer(playbookReference)) {
        //     inputs.lambdaServer = await this.infrastructure.allocateLambdaServer('nodejs');
        // }

        const playbook = new Playbook(playbookReference, inputs, this.interactive);
        await playbook.ready;
        return playbook;
    }

}
