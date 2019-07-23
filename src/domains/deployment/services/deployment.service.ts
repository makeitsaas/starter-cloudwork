import { Environment, Service, ServiceDeployment, ServiceSpecification } from '@entities';
import { em, _EM_ } from '@decorators';
import { EntityManager } from 'typeorm';

export class DeploymentService {

    @em(_EM_.deployment)
    private em: EntityManager;

    async getOrCreateService({uuid, repositoryUrl, type}: ServiceSpecification): Promise<Service> {
        const existingService: Service | void = await this.em.getRepository(Service).findOne(uuid);
        if (existingService) {
            if (existingService.repositoryUrl !== repositoryUrl) {
                existingService.repositoryUrl = repositoryUrl;
                await this.em.save(existingService);
            }
            return existingService;
        } else {
            let newService = new Service();
            newService.uuid = uuid;
            newService.repositoryUrl = repositoryUrl;
            newService.type = type;
            await this.em.save(newService);
            return newService;
        }
    }

    async getOrCreateServiceDeployment(service: Service, environment: Environment, options: ServiceSpecification): Promise<ServiceDeployment> {
        const existingDeployment: ServiceDeployment | void = await this.em.getRepository(ServiceDeployment).findOne({
            where: {
                service,
                environment
            }
        });
        if (existingDeployment) {
            return existingDeployment;
        } else {
            let newServiceDeployment = new ServiceDeployment();
            newServiceDeployment.service = service;
            newServiceDeployment.environment = environment;
            newServiceDeployment.path = options.path;
            newServiceDeployment.type = options.type;
            newServiceDeployment.repositoryVersion = options.repositoryVersion;
            await this.em.save(newServiceDeployment);
            return newServiceDeployment;
        }
    }
}
