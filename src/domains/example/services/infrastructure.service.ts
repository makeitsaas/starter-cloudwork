import { EntityManager } from 'typeorm';
import { em, _EM_, service } from '@decorators';
import { LambdaServer } from '../entities/lambda-server';
import { AwsJobRunnerService } from './aws-job-runner.service';

export interface CDNBucketInfo {
    provider: 'aws';
    host: string;
    port: number;
    secure: boolean;
    bucketName: string;
    bucketPath: string;
    bucketURI: string;
    spa: boolean;
}

export class InfrastructureService {

    @em(_EM_.infrastructure)
    private em: EntityManager;

    @service
    awsService: AwsJobRunnerService;

    async testAWSConnection() {
        console.log('todo');
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
}


