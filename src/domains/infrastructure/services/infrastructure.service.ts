import { Environment, Server, ServerPort, ServiceDeployment } from '@entities';
import { DatabaseAllocation } from '@entities';
import { ComputingAllocation } from '@entities';
import { NoPortAvailableOnServer } from '@errors';
import { EntityManager } from 'typeorm';
import { em, _EM_ } from '@decorators';

export class InfrastructureService {

    @em(_EM_.infrastructure)
    private em: EntityManager;

    async getDeployedServices(environment: Environment): Promise<ServiceDeployment[]> {
        return await this.em.getRepository(ServiceDeployment).find({
            where: {
                environment
            },
            relations: ["service"]
        });
    }

    async allocateDevComputing(): Promise<ComputingAllocation> {
        const server = await this.getDevComputingServer();
        const allocation = new ComputingAllocation();
        allocation.allocatedPort = this.getAvailablePort(server);   // TODO : check if necessary to write Promise.resolve(await this.getAvailablePort(server))

        await this.em.save(allocation);

        return allocation;
    }

    async allocateDevDatabase(): Promise<DatabaseAllocation> {
        const server = await this.getDevDatabaseServer();
        const allocation = new DatabaseAllocation();

        allocation.server = Promise.resolve(server);
        allocation.bastion = Promise.resolve(server);

        await this.em.save(allocation);

        return allocation;
    }

    private async getDevComputingServer(): Promise<Server> {
        return this.em.getRepository(Server).findOneOrFail({
            where: {
                status: 'running',
                type: 'computing'
            }
        });
    }

    private async getDevDatabaseServer(): Promise<Server> {
        return this.em.getRepository(Server).findOneOrFail({
            where: {
                status: 'running',
                type: 'devkit'
            }
        });
    }

    private async getAvailablePort(server: Server): Promise<ServerPort> {
        const maxResult: { maxPort: number } = await this.em
            .getRepository(ServerPort)
            .createQueryBuilder('server_port')
            .select('MAX(server_port.port)', 'maxPort')
            .where({
                server
            })
            .getRawOne();

        const allocatePort = new ServerPort();
        allocatePort.port = Math.max(maxResult.maxPort + 1, 3000);

        if (allocatePort.port > 9999) {
            throw new NoPortAvailableOnServer();
        }

        allocatePort.server = Promise.resolve(server);

        await this.em.save(allocatePort);

        return allocatePort;
    }
}
