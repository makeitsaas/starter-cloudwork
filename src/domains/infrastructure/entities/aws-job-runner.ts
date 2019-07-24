import { service } from '@decorators';
import { DescribeInstancesResult, Instance, InstanceId } from 'aws-sdk/clients/ec2';
import { AwsService } from '../services/aws.service';
import { FakeDelay } from '@fake';

export class MissingInstancePublicIpError extends Error {

}

export class AwsJobRunner {
    @service
    aws: AwsService;

    readonly ready: Promise<any>;
    public instanceId: InstanceId;

    constructor(
        private runRequest: Promise<Instance>
    ) {
        this.ready = runRequest
            .then(async (instance: Instance) => {
                if (!instance.InstanceId) {
                    throw new Error('Instance Id not recognized')
                }
                this.instanceId = instance.InstanceId;
                console.log('waiting for instance to be running');
                await FakeDelay.wait(30000);    // Instances would not likely be running before 25s => wait 30s
                await this.aws.onEC2Running(instance.InstanceId);
                await FakeDelay.wait(18000);     // Instance is running, but have to wait ssh daemon is up => easier to wait than ssh check
                                                    // Usually less thant 10 seconds, but sometimes greater
            })
    }

    async getInstanceId(): Promise<InstanceId> {
        await this.ready;
        return this.instanceId;
    }

    async getPublicIp(): Promise<string> {
        await this.ready;
        const description: Instance = await this.aws.describeEC2Instance(this.instanceId);
        if(description.PublicIpAddress) {
            return description.PublicIpAddress;
        } else {
            throw new MissingInstancePublicIpError();
        }
    }
}
