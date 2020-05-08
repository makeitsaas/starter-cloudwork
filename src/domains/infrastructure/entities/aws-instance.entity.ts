import { em, service } from '@decorators';
import { Instance, InstanceId } from 'aws-sdk/clients/ec2';
import { AwsEc2Service } from '../services/aws-ec2.service';
import { FakeDelay } from '@fake';
import {
    Column,
    CreateDateColumn, Entity,
    EntityManager, OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';
import { ClusterNode } from '../../clusters/entities/cluster-node.entity';

export class MissingInstancePublicIpError extends Error {}
export class MissingInstancePrivateIpError extends Error {}

@Entity()
export class AwsInstance {
    @em()
    private em: EntityManager;

    @service
    aws: AwsEc2Service;

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    instanceId: InstanceId;

    @OneToOne(type => ClusterNode, c => c.instance)
    clusterNode: Promise<ClusterNode>;

    @CreateDateColumn({type: 'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({type: 'timestamp'})
    updatedAt: Date;

    async onReady() {
        console.log('wait AwsInstance ready');
        await FakeDelay.wait(30000);    // Instances would not likely be running before 25s => wait 30s
        await this.aws.onEC2Running(this.instanceId);
        await FakeDelay.wait(18000);     // Instance is running, but have to wait ssh daemon is up => easier to wait than ssh check
    }

    async save() {
        return this.em.save(this);
    }

    async getInstanceId(): Promise<InstanceId> {
        return this.instanceId;
    }

    async getPublicIp(): Promise<string> {
        const description: Instance = await this.aws.describeEC2Instance(this.instanceId);
        if(description.PublicIpAddress) {
            return description.PublicIpAddress;
        } else {
            throw new MissingInstancePublicIpError();
        }
    }

    async getPrivateIp(): Promise<string> {
        const description: Instance = await this.aws.describeEC2Instance(this.instanceId);
        if(description.PrivateIpAddress) {
            return description.PrivateIpAddress;
        } else {
            throw new MissingInstancePrivateIpError();
        }
    }
}
