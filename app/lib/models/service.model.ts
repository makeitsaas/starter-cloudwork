import { Environment, Service, ServiceDeployment, ServiceSpecification } from '@entities';
import { Session } from '@session';

export class ServiceModel {

    constructor(readonly session: Session) {

    }

    async getOrCreateEnvironment(uuid: string): Promise<Environment> {
        const em = await this.session.em();
        const existingEnvironment: Environment|void = await em.getRepository(Environment).findOne(uuid);
        if(existingEnvironment) {
            return existingEnvironment;
        } else {
            let newEnvironment= new Environment();
            newEnvironment.uuid = uuid;
            await em.save(newEnvironment);
            return newEnvironment;
        }
    }

    async getOrCreateService(uuid: string, repositoryUrl: string): Promise<Service> {
        const em = await this.session.em();
        const existingService: Service|void = await em.getRepository(Service).findOne(uuid);
        if(existingService) {
            if(existingService.repositoryUrl !== repositoryUrl) {
                existingService.repositoryUrl = repositoryUrl;
                await em.save(existingService);
            }
            return existingService;
        } else {
            let newService = new Service();
            newService.uuid = uuid;
            newService.repositoryUrl = repositoryUrl;
            await em.save(newService);
            return newService;
        }
    }

    async getOrCreateServiceDeployment(service: Service, environment: Environment, options: ServiceSpecification): Promise<ServiceDeployment> {
        const em = await this.session.em();
        const existingDeployment: ServiceDeployment|void = await em.getRepository(ServiceDeployment).findOne({
            where : {
                service,
                environment
            }
        });
        if(existingDeployment) {
            return existingDeployment;
        } else {
            let newServiceDeployment = new ServiceDeployment();
            newServiceDeployment.service = service;
            newServiceDeployment.environment = environment;
            newServiceDeployment.path = options.path;
            newServiceDeployment.repositoryVersion = options.repositoryVersion;
            await em.save(newServiceDeployment);
            return newServiceDeployment;
        }
    }
}
