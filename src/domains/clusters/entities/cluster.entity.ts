import {
    CreateDateColumn,
    Entity,
    EntityManager,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';
import { em } from '@decorators';
import { ClusterNode } from './cluster-node.entity';

@Entity()
export class Cluster {
    @em()
    private em: EntityManager;

    @PrimaryGeneratedColumn("uuid")
    uuid: string;

    @OneToMany(type => ClusterNode, node => node.cluster, {onDelete: 'CASCADE'})
    nodes: Promise<ClusterNode[]>;

    @CreateDateColumn({type: 'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({type: 'timestamp'})
    updatedAt: Date;
}
