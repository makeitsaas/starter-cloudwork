# Order processing

```
npm run cli -- --order=1 --mode=production
```

## Step by step overview

### Step 1 : order.yml

```
action: "update"
environment_id: "3"
api:
    domains:
      - manager-api.lab.makeitsaas.com
    services:
      - id: "6"
        path: /core
        repository: 
          url: 'https://github.com/makeitsaas/makeitsaas-auth-instance'
        roles: [auth, discovery, upload]
        variables: [] # vault id list 
        type: node
      - id: "7"
        path: /
        repository: 
          url: 'https://github.com/Duwab/makeitsaas-manager-api'
        type: node
front:
    domains:
      - manager-angular.lab.makeitsaas.com
    services:
      - id: "8"
        path: /
        repository: 
          url: 'https://github.com/Duwab/makeitsaas-manager-front'
        type: angular
```


### Step 2 : parsing order = new Order()

Available methods :
```
order.getEnvironmentUuid()
order.getDomains()
order.getServices()
```

We get a verified and easy-to-use object with all necessary information 

### Step 3 : build pipeline

According to the order.action, a dedicated workflow will be executed, with only essential information as input :
 
```src/domains/pipeline/workflow/[order-action].workflow.ts```

All necessary information about the order would be recovered later (workflows tasks are "container aware").

Currently, there is only one action enabled (others have been temporary removed)

```src/domains/pipeline/serices/workflow.service.ts```
```
async processOrder(order: Order) {
        console.log('WorkflowService.processOrder', order.id);
        const requiredServices = order.getServices();
        const deployedServices = await this.infrastructureService.getDeployedServices(order.environment);
        let id = await this.host.startWorkflow("update-environment-workflow", 1, {
            orderId: order.id,
            requiredServicesIds: requiredServices.map(s => s.uuid),
            deployedServicesIds: deployedServices.map(d => d.id),
        });
        console.log('started workflow id:', id);
    }
```


### Step 4 : Task execution

Workflow will be executed by performing all tasks scripts, one after another.

The main environment update workflow consists in these 5 tasks :
1. Updating environment configuration (domain names)
2. Allocating necessary resources
3. Creating missing vault variables
4. Deploying each services
5. Updating proxy routes

Inside each task, there might be different ops operations :
- either aws-sdk action
- or ansible playbook execution


To keep thing consistent, all the deployment-related actions are executed in a specific domain : `src/domains/deployment`

One huge thing of the domain is `service-operator.ts` value object. It can be loaded anytime and has the ability to
perform all incremental actions (generate variables, allocate a server depending on service needs, launch ansible playbook, ...)
The valuable point is that it can take decisions over complex situations, depending on requested specifications and current deployment.

As a part of a whole, each service shall be considered as "independent of the other ones". Few dependencies between
services (essentially discovery service location) shall allow any service to be launch without having to care about others status.
It is the responsibility of the service framework to be "patient" : once it is started, dependencies might not be ready
but it only has to retry few seconds later, and so on. The service will be up, just status would be "incomplete".

**Conclusion :** a workflow will launch complex processing over a specific environment. Each task of the workflow
will use and only use `service-operator.ts` methods to perform any action.

The is also another value object for environment's routing : `environment-proxy-operator.ts`. 

```
export class ServiceOperator {
    service: Service;
    ready: Promise<any>;
    private deployment: ServiceDeployment;

    @em(_EM_.deployment)
    private em: EntityManager;

    @service
    private vaultService: VaultService;

    @service
    private deploymentService: DeploymentService;

    @service
    private infrastructureService: InfrastructureService;

    @service
    private ansibleService: AnsibleService;

    constructor(
        private environment: Environment,
        private action: string,
        private specification: ServiceSpecification | void,
        private currentComputeDeployment: ServiceDeployment | void
    ) {
        ...
    }

    ...

}
```

## Summary

1. Push an order
2. Build a workflow
3. Perform tasks of the workflow
4. Each task uses operators (`service-operator`, `environment-proxy-operator`) through `deployment` API
5. `deployment` domain can request an ansible execution with all necessary inputs
6. Ansible domain writes folder execution temporary folder and launches the scripts

If things go wrong, each level can either handle it or throws errors to its parent.

Simplicity and efficiency of deployment operators actions are the key of the success of the application. And this
comes directly from the services framework specifications.
