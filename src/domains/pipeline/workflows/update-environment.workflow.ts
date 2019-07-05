import { WorkflowBase, WorkflowBuilder } from 'workflow-es';

import { EnvironmentUpdateConfigurationTask } from '../tasks/environment-update-configuration.task';
import { ServiceAllocateResourcesTask } from '../tasks/service-allocate-resources.task';
import { ProxyReloadTask } from '../tasks/proxy-reload.task';
import { ServiceCleanupTask } from '../tasks/service-cleanup.task';
import { ServiceDeployTask } from '../tasks/service-deploy.task';
import { ServiceVaultSetupTask } from '../tasks/service-vault-setup.task';
import { em } from '@decorators';
import { EntityManager } from 'typeorm';

export class UpdateEnvironmentWorkflow implements WorkflowBase<any> {
    public id: string = "update-environment-workflow";
    public version: number = 1;

    @em('main')
    private em: EntityManager;

    public build(builder: WorkflowBuilder<any>) {
        builder
            .startWith(EnvironmentUpdateConfigurationTask)
            .input((step, data) => {
                // step => StepClass instance
                // data => workflow-level data, stored in mongodb and initiated when calling startWorkflow
                step.orderId = data.orderId;
            })
            .then(ServiceVaultSetupTask)
            .then(ServiceAllocateResourcesTask)
            .then(ServiceDeployTask)
            .then(ProxyReloadTask)
            .then(ServiceCleanupTask);
    }
}
