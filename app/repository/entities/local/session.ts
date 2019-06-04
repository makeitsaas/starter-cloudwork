import { Connection, EntityManager, QueryRunner } from 'typeorm';
import { dbLoader } from '../../databases/infrastructure-database';
import { vaultDbLoader } from '../../databases/vaults-database';
import { EnvironmentVault } from '@entities';
import { InfrastructureModel } from '../../../scheduler/models/infrastructure.model';

export class Session {

    readonly _loading: Promise<any>;
    private _connection: Connection;
    private _vaultConnection: Connection;
    private _em: EntityManager;
    private _queryRunner: QueryRunner;
    public infrastructure: InfrastructureModel;

    constructor() {
        this._loading = Promise.all([
            this.initConnection(),
            this.initVaultConnection(),
            this.initInfrastructureModel()
        ]);
    }

    ready(): Promise<any> {
        return this._loading;
    }

    private cleanupDone = false;

    async cleanup(): Promise<number> {
        if (this.cleanupDone)
            return -1;  // code -1 = pending cleanup
        await this._loading;    // startup shall be over
        this.cleanupDone = true;
        let code = 0;
        try {
            console.log('cleanup try');
            await this._queryRunner.commitTransaction();
        } catch (e) {
            console.log('cleanup catch');
            code = -1;
            await this._queryRunner.rollbackTransaction();
        } finally {
            console.log('cleanup release');
            await this._queryRunner.release();
        }
        return code;
    }

    saveEntity(entity: any): Promise<any> {
        return this.em().then(em => em.save(entity));
    }

    em(): Promise<EntityManager> {
        return this.getEntityManager();
    }

    getEntityManager(): Promise<EntityManager> {
        return this._loading.then(() => {
            return this._em;
        });
    }

    getVault(environmentId: string): Promise<EnvironmentVault> {
        return this._vaultConnection
            .manager
            .getRepository(EnvironmentVault)
            .findOne({where: {environment_id: environmentId}})
            .then(vault => {
                if(!vault) {
                    vault = new EnvironmentVault();
                    vault.environmentId = environmentId;
                }

                vault.assignSession(this);
                vault.assignEm(this._vaultConnection.manager);

                return vault;
            });
    }

    /*
     * ---------------
     * Private methods
     * ---------------
     */

    private initConnection() {
        return dbLoader.then(async (connection: Connection) => {
            this._connection = connection;
            this._queryRunner = this._connection.createQueryRunner();
            await this._queryRunner.connect();
            await this._queryRunner.startTransaction();
            this._em = this._queryRunner.manager;

            return this._em;
        })
    }

    private initVaultConnection() {
        return vaultDbLoader.then(async (connection: Connection) => {
            this._vaultConnection = connection;
            return connection;
        });
    }

    private initInfrastructureModel() {
        this.infrastructure = new InfrastructureModel(this);
    }
}
