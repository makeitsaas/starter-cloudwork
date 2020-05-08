// TODO : move to shared/providers
import * as EC2 from 'aws-sdk/clients/ec2';
import { DescribeInstancesResult, InstanceId, TerminateInstancesRequest } from 'aws-sdk/clients/ec2';
import { FakeDelay } from '@fake';

const RETRY_LIMIT = 20;
class InstanceStartTimeoutError extends Error {}
class InstanceAllocationFailedError extends Error {}

export class AwsEc2Service {
    private ec2 = new EC2({apiVersion: '2016-11-15'});

    async onEC2Running(instanceId: InstanceId) {
        let i = 0;

        while (i < RETRY_LIMIT) {
            let instance = await this.describeEC2Instance(instanceId);
            console.log('check if ec2 is running', instance.State);
            if (instance.State && instance.State.Name === 'running') {
                return;
            }
            await FakeDelay.wait(5000);
            i++;
        }

        throw new InstanceStartTimeoutError();
    }

    async describeEC2Instance(instanceId: InstanceId) {
        return this.ec2.describeInstances({
            InstanceIds: [instanceId]
        }).promise().then((result: DescribeInstancesResult) => {
            if (result.Reservations && result.Reservations[0] && result.Reservations[0].Instances && result.Reservations[0].Instances[0]) {
                return result.Reservations && result.Reservations[0] && result.Reservations[0].Instances && result.Reservations[0].Instances[0];
            } else {
                throw new Error('Instance not found');
            }
        });
    }

    async terminateEC2Instance(instanceId: InstanceId) {
        console.log('terminateEC2Instance', instanceId);
        const ec2 = new EC2({apiVersion: '2016-11-15'});
        let params: TerminateInstancesRequest = {
            InstanceIds: [instanceId]
        };
        return ec2.terminateInstances(params).promise().then((info: any) => {
            console.log('termination response', info);
        });
    }
}
