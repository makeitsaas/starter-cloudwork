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

    async getManagerNode(): Promise<ClusterNode|void> {
        const nodes = await this.nodes;
        return nodes[0];
    }

    async getManagerIp(): Promise<string|void> {
        const nodes = await this.nodes;
        if(nodes.length) {
            const manager = nodes[0];
            const managerEC2Instance = await manager.instance;
            return await managerEC2Instance.getPublicIp();
        }
    }
}
