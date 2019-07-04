import { EntityManager } from 'typeorm';
import { EnvironmentVault, ServiceDeploymentVault } from '@entities';
import { em, _EM_ } from '@decorators';

// ici on doit avoir en stock tous les vaults, histoire de ne retourner que ceux concernés

export class VaultService {
    @em(_EM_.vault)
    protected em: EntityManager;

    private vaults: {
        deployment: { [uuid: string]: Promise<ServiceDeploymentVault> }
        environment: { [uuid: string]: Promise<EnvironmentVault> }
    } = {
        'deployment': {},
        'environment': {},
    };

    public async getDeploymentVault(deploymentUuid: string) {
        if (!this.vaults.deployment[deploymentUuid]) {
            this.vaults.deployment[deploymentUuid] =
                this.em.getRepository(ServiceDeploymentVault)
                    .findOne({where: {serviceDeploymentUuid: deploymentUuid}})
                    .then(async (vault) => {
                        if (!vault) {
                            vault = new ServiceDeploymentVault();
                            vault.serviceDeploymentUuid = deploymentUuid;
                        }
                        return vault;
                    });
        }

        return await this.vaults.deployment[deploymentUuid];
    }

    public async getEnvironmentVault(environmentUuid: string): Promise<EnvironmentVault> {
        if (!this.vaults.environment[environmentUuid]) {
            this.vaults.environment[environmentUuid] =
                this.em.getRepository(EnvironmentVault)
                    .findOne({where: {environmentUuid}})
                    .then(async (vault) => {
                        if (!vault) {
                            vault = new EnvironmentVault();
                            vault.environmentUuid = environmentUuid;
                        }
                        return vault;
                    });
        }

        return await this.vaults.environment[environmentUuid];
    }
}
