import { EntityManager } from 'typeorm';
import { em, service } from '@decorators';
import { Cluster } from '../entities/cluster.entity';
import { ClusterNode } from '../entities/cluster-node.entity';
import { NodeBuilderService } from '../../infrastructure/services/node-builder.service';

export class ManageClusterService {
    @em()
    private em: EntityManager;

    @service
    private nodeBuilderService: NodeBuilderService;

    async createCluster(options: any = {}): Promise<Cluster> {
        const cluster = await this.em.save(new Cluster());

        await this.addNodeToCluster(cluster);
        console.log('we add cluster, at least 1 manager, and eventually workers');

        return cluster;
    }

    async addNodeToCluster(cluster: Cluster): Promise<ClusterNode> {
        const node = new ClusterNode();
        node.cluster = Promise.resolve(cluster);

        // requires permission mis_swarm_node_launcher
        const nodeInstance = await this.nodeBuilderService.allocateNodeInstance();
        node.instance = Promise.resolve(nodeInstance);
        await this.em.save(node);
        await nodeInstance.onReady();

        return node;
    }
}
