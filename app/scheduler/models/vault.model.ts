// Here we have a singleton for vault database
import { vaultDbLoader } from '../../repository/databases/vaults-database';
import { Connection } from 'typeorm';
import { EnvironmentVault } from '@entities';

console.log('->->->->-> vault model init');

const dbConnection = vaultDbLoader.then(async (connection: Connection) => {
    return connection;
});

const dbManager = dbConnection.then(connection => connection.manager);
const environmentVaultRepository = dbManager.then(manager => manager.getRepository(EnvironmentVault));

// ici on doit avoir en stock tous les vaults, histoire de ne retourner que ceux concernés

export class VaultModel {
    private static vaults: { [type: string]: { [uuid: string]: Promise<EnvironmentVault> } } = {
        'environment': {}
    };

    public static async getDeploymentVault() {
        console.log('->->->->-> get vault');
        const repo = await environmentVaultRepository;
        const vault = await repo.findOneOrFail('3');

        console.log('found vault', vault.getValues());

        return vault;
    }

    public static async getEnvironmentVault(environmentUuid: string): Promise<EnvironmentVault> {
        console.log('->->->->-> get vault');
        if (!this.vaults.environment[environmentUuid]) {
            const repo = await environmentVaultRepository;
            this.vaults.environment[environmentUuid] = repo.findOne(environmentUuid).then(async (vault) => {
                const em = await dbManager;
                if (!vault) {
                    vault = new EnvironmentVault();
                    vault.environmentUuid = environmentUuid;
                }
                vault.assignEm(em);
                return vault;
            });
        }
        const vault = await this.vaults.environment[environmentUuid];

        console.log('found vault', vault.getValues());

        return vault;
    }
}
