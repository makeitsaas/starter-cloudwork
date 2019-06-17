import {
    Environment,
    ServiceDeployment,
    Session
} from '@entities';
import { VaultModel } from '@models';
import { Playbook } from './playbook';



export class DeployerAnsible {
    constructor(private session: Session, private interactive: boolean) {
    }

    async preparePlaybook(playbookReference: string, environment: Environment, deployment?: ServiceDeployment): Promise<Playbook> {
        const environmentVault = await VaultModel.getEnvironmentVault(environment.uuid);
        const deploymentVault = deployment ? await VaultModel.getDeploymentVault(`${deployment.id}`) : undefined;
        const playbook = new Playbook(playbookReference, environment, environmentVault, deployment, deploymentVault, this.interactive);
        await playbook.ready;

        return playbook;
    }
}
