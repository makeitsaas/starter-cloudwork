import { ServiceDeployment, Session } from '@entities';

export class InfrastructureModel {

    constructor(readonly _session: Session) {
    }

    async getDeployedServices(environmentUuid: string): Promise<ServiceDeployment[]> {
        const em = await this._session.em();

        return await em.getRepository(ServiceDeployment).find({
            where:{
                environmentId: environmentUuid
            },
            relations: ["service"]
        });
    }
}
