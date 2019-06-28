// Here we have a singleton for vault database
import { vaultDbLoader } from '@databases';
import { Connection } from 'typeorm';
import { EnvironmentVault, ServiceDeploymentVault } from '@entities';

const dbConnection = vaultDbLoader.then(async (connection: Connection) => {
    return connection;
});

const dbManager = dbConnection.then(connection => connection.manager);
const serviceDeploymentVaultRepository = dbManager.then(manager => manager.getRepository(ServiceDeploymentVault));
const environmentVaultRepository = dbManager.then(manager => manager.getRepository(EnvironmentVault));

// ici on doit avoir en stock tous les vaults, histoire de ne retourner que ceux concernés

export class VaultService {
    private static vaults: {
        deployment: { [uuid: string]: Promise<ServiceDeploymentVault> }
        environment: { [uuid: string]: Promise<EnvironmentVault> }
    } = {
        'deployment': {},
        'environment': {},
    };

    public static async getDeploymentVault(deploymentUuid: string) {
        if (!this.vaults.deployment[deploymentUuid]) {
            const repo = await serviceDeploymentVaultRepository;
            this.vaults.deployment[deploymentUuid] =
                repo
                    .findOne({where: {serviceDeploymentUuid: deploymentUuid}})
                    .then(async (vault) => {
                        const em = await dbManager;
                        if (!vault) {
                            vault = new ServiceDeploymentVault();
                            vault.serviceDeploymentUuid = deploymentUuid;
                        }
                        vault.assignEm(em);
                        return vault;
                    });
        }

        return await this.vaults.deployment[deploymentUuid];
    }

    public static async getEnvironmentVault(environmentUuid: string): Promise<EnvironmentVault> {
        if (!this.vaults.environment[environmentUuid]) {
            const repo = await environmentVaultRepository;
            this.vaults.environment[environmentUuid] =
                repo
                    .findOne({where: {environmentUuid}})
                    .then(async (vault) => {
                        const em = await dbManager;
                        if (!vault) {
                            vault = new EnvironmentVault();
                            vault.environmentUuid = environmentUuid;
                        }
                        vault.assignEm(em);
                        return vault;
                    });
        }

        return await this.vaults.environment[environmentUuid];
    }
}
