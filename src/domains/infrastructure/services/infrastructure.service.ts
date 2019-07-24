import { Environment, Server, ServerPort, ServiceDeployment } from '@entities';
import { DatabaseAllocation } from '@entities';
import { ComputingAllocation } from '@entities';
import { NoPortAvailableOnServer } from '@errors';
import { EntityManager } from 'typeorm';
import { em, _EM_, service } from '@decorators';
import { LambdaServer } from '@entities';
import { FakeDelay } from '@fake';
import { AwsService } from './aws.service';


export class InfrastructureService {

    @em(_EM_.infrastructure)
    private em: EntityManager;

    @service
    awsService: AwsService;

    async testAWSConnection() {
        console.log('test');
        const jobRunner = await this.awsService.allocateJobRunner();
        console.log('public ip :', await jobRunner.getPublicIp());
        await FakeDelay.wait(15000);    // Test purpose
        return this.awsService.terminateEC2Instance(jobRunner.instanceId)
    }

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

    async allocateLambdaServer(type: string, timeout?: number): Promise<LambdaServer> {
        console.log('allocate lambda');
        const jobRunner = await this.awsService.allocateJobRunner(),
            instanceId = await jobRunner.getInstanceId(),
            instancePublicIp = await jobRunner.getPublicIp();

        let lambda = new LambdaServer();
        lambda.ip = instancePublicIp;
        lambda.instanceId = instanceId;
        lambda.type = 'nodejs';
        lambda.timeout = timeout || lambda.timeout;

        lambda = await this.em.save(lambda);
        lambda.tmpDirectory = '/srv/lambda-' + lambda.id;
        lambda = await this.em.save(lambda);

        console.log('lambda ok', lambda);
        return lambda;
    }

    /**
     *
     * Private methods
     *
     */

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


