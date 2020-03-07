import { EntityManager } from 'typeorm';
import { em } from '@decorators';
import { Cluster } from '../entities/cluster.entity';
import { ClusterNode } from '../entities/cluster-node.entity';

export class ManageClusterService {
    @em()
    private em: EntityManager;

    async createCluster(options: any = {}) {
        const cluster = await this.em.save(new Cluster());
        const node = new ClusterNode();
        node.cluster = Promise.resolve(cluster);
        console.log('cluster', cluster);
        console.log("node", await this.em.save(node));
        console.log('we add cluster, at least 1 manager, and eventually workers');
    }
}
