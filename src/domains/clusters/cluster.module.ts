import { service } from '@decorators';
import { ManageClusterService } from './services/manage-cluster.service';

export class ClusterModule {
    readonly ready: Promise<any>;

    @service
    manageCluster: ManageClusterService;

    constructor() {
    }

    async doSomethingSimple() {
        return this.manageCluster.createCluster();
    }

}
