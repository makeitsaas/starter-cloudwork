import { service } from '@decorators';
import { ManageClusterService } from './services/manage-cluster.service';
import { Cluster } from './entities/cluster.entity';
import { ClusterNode } from './entities/cluster-node.entity';

export class ClusterModule {
    @service
    private manageCluster: ManageClusterService;

    async createCluster(): Promise<Cluster> {
        return this.manageCluster.createCluster();
    }

    async addNodeToCluster(cluster: Cluster): Promise<ClusterNode> {
        return this.manageCluster.addNodeToCluster(cluster);
    }
}
