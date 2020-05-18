import { em, service } from '@decorators';
import { ManageClusterService } from './services/manage-cluster.service';
import { Cluster } from './entities/cluster.entity';
import { ClusterNode } from './entities/cluster-node.entity';
import { EntityManager } from 'typeorm';

export class ClusterModule {
    @em()
    private em: EntityManager;

    @service
    private manageCluster: ManageClusterService;

    async getClusters(): Promise<Cluster[]> {
        return this.em.getRepository(Cluster).find();
    }

    async createCluster(): Promise<Cluster> {
        return this.manageCluster.createCluster();
    }

    async addNodeToCluster(cluster: Cluster): Promise<ClusterNode> {
        return this.manageCluster.addNodeToCluster(cluster);
    }
}
