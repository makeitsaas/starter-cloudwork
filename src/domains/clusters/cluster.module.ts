import { service } from '@decorators';
import { ManageClusterService } from './services/manage-cluster.service';
import { Cluster } from './entities/cluster.entity';

export class ClusterModule {
    @service
    private manageCluster: ManageClusterService;

    async createCluster(): Promise<Cluster> {
        return this.manageCluster.createCluster();
    }
}
