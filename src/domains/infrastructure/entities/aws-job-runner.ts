import { service } from '@decorators';
import { Instance } from 'aws-sdk/clients/ec2';
import { AwsService } from '../services/aws.service';
import { FakeDelay } from '@fake';

export class AwsJobRunner {
    @service
    aws: AwsService;

    readonly ready: Promise<any>;

    constructor(
        private runRequest: Promise<Instance>
    ) {
        this.ready = runRequest
            .then(async (instance: Instance) => {
                if (!instance.InstanceId) {
                    throw new Error('Instance Id not recognized')
                }
                console.log('waiting for instance to be running');
                await FakeDelay.wait(20000);    // Instances would not likely be running before 20s
                await this.aws.onEC2Running(instance.InstanceId);
                await FakeDelay.wait(15000);    // Test purpose
                return this.aws.terminateEC2Instance(instance.InstanceId)
            })
    }
}
