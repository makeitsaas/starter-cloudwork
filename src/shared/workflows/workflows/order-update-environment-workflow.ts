// export class OrderPipeline {

/*

- checks (les repos existent, format proxy ok, droits d'allocations ok, ...)
- allocations
- maintenance
- deployments

if ok
- proxy reload
- unset maintenance
- cleanup

if ko
- rollback
- unset maintenance
- cleanup

 */

const RULES = {
    states: [
        'maintenance-setup'
    ],
    transitions: {
        from: 'truc',
        to: 'truc'
    }
};

export class OrderUpdateEnvironmentWorkflow {
    private state = 'init';
    private orderSpecifications = {
        id: 1,
        environmentUuid: 1,
        host: ['site.com'],
        services: [
            {uuid: 1, path: '/truc'},
            {uuid: 2, path: '/bidule'},
        ]
    };

    private history: {
        state: string,
        status: ('started' | 'pre-hook' | 'done' | 'post-hook' | 'failed')
        parameters: any
        date: Date
        error: any
    }[] = [];

    constructor() {
    }

    run() {
        // while not over, await this.next();
    }

    next() {
        // from history, we can deduce which step shall be fulfilled
        // promise string (step|'over')
    }

    stepInit() {

    }

    stepAllocation() {
        // serviceOperator->allocate()
    }

    stepMaintenanceSetup() {
        // environment->setMaintenanceMode()
    }

    stepServiceDeployment() {
        // computing + database
        // serviceOperator->deployDatabase()
        // serviceOperator->deployComputing()
        // serviceOperator->migrations()
    }

    stepProxy() {

    }

    stepUnsetMaintenance() {
        // environment->unsetMaintenanceMode()
    }

    stepCleanup() {

    }


    /**
     *
     * Pre-checks
     *
     */

    canAllocate() {
        // foreach service, check if can allocate
        // plus check if total amount of expected allocated services are acceptable
    }

    canSetMaintenance() {
        // shall no be maintenance
    }

    canDeploy() {
        // foreach service, shall be ok
    }

    canUpdateProxy() {
        // domain shall be ok, and syntax too
    }


    /**
     *
     * Pre-scripts
     *
     */
    onBeforeAllocate() {

    }

    /**
     *
     * Post-scripts
     *
     */
    onAfterAllocate() {

    }


}
