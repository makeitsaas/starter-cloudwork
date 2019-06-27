import { Connection, EntityManager, QueryRunner } from 'typeorm';
import { ServiceModel } from '@models';
import { dbLoader } from '@databases';
import { InfrastructureService } from '@services';

export class Session {

    readonly _loading: Promise<any>;
    private _connection: Connection;
    private _em: EntityManager;
    private _emTransactional: EntityManager;
    private _queryRunner: QueryRunner;
    public infrastructure: InfrastructureService;

    constructor() {
        this._loading = Promise.all([
            this.initConnection(),
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
            return this._emTransactional;
        });
    }

    async load(InjectionClass: any): Promise<any> {
        if(InjectionClass === ServiceModel) {
            return new InjectionClass(this);
        } else {
            throw new Error('Dependency injection not set for this class');
        }
    }

    /*
     * ---------------
     * Private methods
     * ---------------
     */

    private initConnection() {
        return dbLoader.then(async (connection: Connection) => {
            this._connection = connection;
            this._em = this._connection.manager;
            this._queryRunner = this._connection.createQueryRunner();
            await this._queryRunner.connect();
            await this._queryRunner.startTransaction();
            this._emTransactional = this._queryRunner.manager;

            return this._em;
        })
    }

    private initInfrastructureModel() {
        this.infrastructure = new InfrastructureService(this);
    }
}
