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
     * Public methods
     * ---------------
     */

    async allocate() {
        if(this.specification) {
            console.log(`get service by uuid=${this.specification.uuid}`);
            console.log('create deployment if not exists');
            console.log('assign servers and ports');
        }
    }

    async registerVaultValues(vault: EnvironmentVault) {
        if(this.specification) {
            console.log(`register vault values for service(${this.specification.uuid})`);
        }
    }

    async deploy() {
        await this.runDatabaseScript();
        await this.runComputeScript();
        await this.runMigrationsScript();
    }

    async cleanup() {
        console.log('clean me');
    }

    async dropDeployment() {
        console.log('drop me');
    }

    /*
     * ---------------
     * Private methods
     * ---------------
     */

    private async runDatabaseScript() {
        console.log('database script');
    }

    private async runComputeScript() {
        console.log('compute script');
    }

    private async runMigrationsScript() {
        console.log('migration script');
    }

    private async runCleanupScript() {
        console.log('cleanup script');
    }
}
