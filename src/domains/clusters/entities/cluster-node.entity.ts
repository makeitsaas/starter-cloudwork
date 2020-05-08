import {
    CreateDateColumn,
    Entity,
    EntityManager, JoinColumn,
    ManyToOne, OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';
import { em } from '@decorators';
import { Cluster } from './cluster.entity';
import { AwsInstance } from '../../infrastructure/entities/aws-instance.entity';

@Entity()
export class ClusterNode {
    @em()
    private em: EntityManager;

    @PrimaryGeneratedColumn("uuid")
    uuid: string;

    @ManyToOne(type => Cluster, c => c.nodes)
    cluster: Promise<Cluster>;

    @OneToOne(type => AwsInstance, c => c.clusterNode)
    @JoinColumn()
    instance: Promise<AwsInstance>;

    @CreateDateColumn({type: 'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({type: 'timestamp'})
    updatedAt: Date;
}
