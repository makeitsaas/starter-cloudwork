import { Environment, Server, ServerPort, ServiceDeployment, Session } from '@entities';
import { DatabaseAllocation } from '@entities/infrastructure/database-allocation';
import { ComputingAllocation } from '@entities/infrastructure/computing-allocation';
import { NoPortAvailableOnServer } from '@errors';

export class InfrastructureModel {

    constructor(readonly session: Session) {
    }

    async getDeployedServices(environment: Environment): Promise<ServiceDeployment[]> {
        const em = await this.session.em();

        return await em.getRepository(ServiceDeployment).find({
            where: {
                environment
            },
            relations: ["service"]
        });
    }

    async allocateDevComputing(): Promise<ComputingAllocation> {
        const server = await this.getDevComputingServer();
        const allocation = new ComputingAllocation();
        allocation.allocatedPort = await this.getAvailablePort(server);

        await this.session.saveEntity(allocation);

        return allocation;
    }

    async allocateDevDatabase(): Promise<DatabaseAllocation> {
        const server = await this.getDevDatabaseServer();
        const allocation = new DatabaseAllocation();

        allocation.server = Promise.resolve(server);
        allocation.bastion = Promise.resolve(server);

        await this.session.saveEntity(allocation);

        return allocation;
    }

    private async getDevComputingServer(): Promise<Server> {
        return (await this.session.em()).getRepository(Server).findOneOrFail({
            where: {
                status: 'running',
                type: 'computing'
            }
        });
    }

    private async getDevDatabaseServer(): Promise<Server> {
        return (await this.session.em()).getRepository(Server).findOneOrFail({
            where: {
                status: 'running',
                type: 'devkit'
            }
        });
    }

    private async getAvailablePort(server: Server): Promise<ServerPort> {
        const maxResult: { maxPort: number } = await (await this.session.em())
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

        await this.session.saveEntity(allocatePort);

        return allocatePort;
    }
}