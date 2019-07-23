import { Environment, Server, ServerPort, ServiceDeployment } from '@entities';
import { DatabaseAllocation } from '@entities';
import { ComputingAllocation } from '@entities';
import { NoPortAvailableOnServer } from '@errors';
import { EntityManager } from 'typeorm';
import { em, _EM_ } from '@decorators';
import { LambdaServer } from '@entities';
import { FakeDelay } from '@fake';
import * as EC2 from 'aws-sdk/clients/ec2';


const TMP_STATIC_LAMBDA_SERVER_IP = '35.157.192.169';

export class InfrastructureService {

    @em(_EM_.infrastructure)
    private em: EntityManager;

    async testAWSConnection() {
        console.log('test');
        let ec2 = new EC2({apiVersion: '2016-11-15'});
        const instanceParams = {
            ImageId: 'ami-0a8412cbcfcef4252',
            InstanceType: 't2.small',
            KeyName: 'adu-dev',
            SecurityGroupIds: ['sg-04c858cae6f24e840'],
            SubnetId: 'subnet-01a2857a',
            IamInstanceProfile: {
                Name: 'ec2-job-runner'
            },
            TagSpecifications: [{
                ResourceType: 'instance',
                Tags: [{
                    Key: 'mis-instance-type',
                    Value: 'job-runner'
                }]
            }],
            MinCount: 1,
            MaxCount: 1
        };
        const info = ec2.runInstances(instanceParams).promise();
        info.then((v: any) => console.log(v));

        return info;
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
        console.log('waiting for lambda server allocation (fake delay)');
        await FakeDelay.wait(1000);

        let lambda = new LambdaServer();
        lambda.ip = TMP_STATIC_LAMBDA_SERVER_IP;
        lambda.type = 'nodejs';
        lambda.timeout = timeout || lambda.timeout;

        lambda = await this.em.save(lambda);
        lambda.tmpDirectory = '/srv/lambda-' + lambda.id;
        lambda = await this.em.save(lambda);

        return lambda;
    }

    async releaseLambdaServer(lambda: LambdaServer): Promise<LambdaServer> {
        lambda.stoppedAfterTimeout = lambda.hasReachedTimeout();
        lambda.status = 'stopped';

        return this.em.save(lambda);
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


