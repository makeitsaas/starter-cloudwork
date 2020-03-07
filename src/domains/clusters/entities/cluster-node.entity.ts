import {
    CreateDateColumn,
    Entity,
    EntityManager,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';
import { em } from '@decorators';
import { Cluster } from './cluster.entity';

@Entity()
export class ClusterNode {
    @em()
    private em: EntityManager;

    @PrimaryGeneratedColumn("uuid")
    uuid: string;

    @ManyToOne(type => Cluster, c => c.nodes)
    cluster: Promise<Cluster>;

    @CreateDateColumn({type: 'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({type: 'timestamp'})
    updatedAt: Date;
}
