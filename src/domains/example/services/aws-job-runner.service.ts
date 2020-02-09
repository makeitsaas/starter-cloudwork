// TODO : move to shared/providers

import * as EC2 from 'aws-sdk/clients/ec2';
import { DescribeInstancesResult, InstanceId, Reservation, TerminateInstancesRequest } from 'aws-sdk/clients/ec2';
import { FakeDelay } from '@fake';
import { AwsJobRunner } from '../entities/aws-job-runner';

const RETRY_LIMIT = 20;


class InstanceStartTimeoutError extends Error {

}

class InstanceAllocationFailedError extends Error {

}

export class AwsJobRunnerService {
    private ec2 = new EC2({apiVersion: '2016-11-15'});

    async allocateJobRunner(): Promise<AwsJobRunner> {
        const ec2 = new EC2({apiVersion: '2016-11-15'});
        const instanceParams = {
            ImageId: 'ami-0a8412cbcfcef4252',
            InstanceType: 't2.medium',
            // InstanceType: 't2.small',
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
                }, {
                    Key: 'Name',
                    Value: 'auto-job-runner'
                }]
            }],
            MinCount: 1,
            MaxCount: 1
        };
        const info = ec2.runInstances(instanceParams).promise();

        const instancePromise = info.then((result: Reservation) => {
            if (result && result.Instances && result.Instances.length === 1) {
                return result.Instances[0];
            } else {
                throw new InstanceAllocationFailedError()
            }
        });

        return new AwsJobRunner(instancePromise);
    }

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
