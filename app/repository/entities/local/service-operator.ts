import { EnvironmentVault, Service, ServiceDeployment } from '@entities';

export class ServiceOperator {
    service: Service;
    currentComputeDeployment: ServiceDeployment;
    currentDatabase: any;

    constructor() {
        //
    }

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
