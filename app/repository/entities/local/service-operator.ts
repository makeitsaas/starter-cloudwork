import { EnvironmentVault, Service, ServiceDeployment, ServiceSpecification, Session } from '@entities';

export class ServiceOperator {
    service: Service;
    currentDatabase: any;

    constructor(
        private session: Session,
        private action: string,
        private specification: ServiceSpecification|void,
        private currentComputeDeployment: ServiceDeployment|void
    ) {
    }

    /*
     * ---------------
     *
     * ---------------
     */

    registerVaultValues(vault: EnvironmentVault) {

    }

    runDatabaseScript() {

    }

    runComputeScript() {

    }

    runMigrations() {

    }

    runCleanup() {

    }
}
