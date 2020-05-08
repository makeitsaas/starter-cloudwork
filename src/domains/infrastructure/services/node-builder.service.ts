// TODO : move to shared/providers
import * as EC2 from 'aws-sdk/clients/ec2';
import { Reservation } from 'aws-sdk/clients/ec2';
import { AwsInstance } from '../entities/aws-instance.entity';

class InstanceStartTimeoutError extends Error {}
class InstanceAllocationFailedError extends Error {}

export class NodeBuilderService {
    async allocateNodeInstance(): Promise<AwsInstance> {
        const ec2 = new EC2({apiVersion: '2016-11-15'});
        const instanceParams = {
            ImageId: 'ami-033e388afef4f8d4d',
            InstanceType: 't2.micro',
            KeyName: 'adu-dev',
            SecurityGroupIds: ['sg-2108c549', 'sg-c50d28ad', 'sg-ff311497'],
            SubnetId: 'subnet-01a2857a',
            IamInstanceProfile: {
                Name: 'ec2-job-runner'
            },
            TagSpecifications: [{
                ResourceType: 'instance',
                Tags: [{
                    Key: 'mis-instance-type',
                    Value: 'swarm-node'
                }, {
                    Key: 'Name',
                    Value: 'swarm-node'
                }]
            }],
            MinCount: 1,
            MaxCount: 1
        };
        const infoPromise = ec2.runInstances(instanceParams).promise();

        const instanceInfo = await infoPromise.then((result: Reservation) => {
            if (result && result.Instances && result.Instances.length === 1) {
                return result.Instances[0];
            } else {
                throw new InstanceAllocationFailedError()
            }
        });

        if (!instanceInfo.InstanceId) {
            throw new Error('Instance Id not recognized')
        }

        const node = new AwsInstance();
        node.instanceId = instanceInfo.InstanceId;

        await node.save();

        return node;
    }
}
