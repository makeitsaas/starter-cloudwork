# Ansible Playbook Execution

Most remote actions are executed using an ansible playbook. Advantage compared to a servlet is that it does not require
any complex server-side installation (only python libs). Second advantage is that each execution can either be run
programmatically, or manually.

Ability to run each operation task manually is extremely useful for development and debugging purposes.
Each execution is kept in the `$PROJECT_PATH/tmp/` folder and it is also possible to look at every configuration, 
variables, playbook.

```
tmp/
 |-- playbook-execution-xxx/
     |-- inventories/
         |-- hosts
     |-- playbooks/
     |-- templates/
         |-- [template-name].j2
     |-- vars/
         |-- default.yml
     |-- root-playbook.yml
```

The playbook that would have been executed is `tmp/playbook-execution-xxx/root-playbook.yml`. To re-run this playbook,
run this command in the execution folder :
```
ansible-playbook -i inventories/hosts root-playbook.yml
```

## About ansible-in-deployer-app

* Straight forward scripts

No or only few business logic in playbooks. This is expected to be in 

* No variable creation

Because secret variables might be reused, they shall be safely stored in vaults. Because it has a specific async logic,
this shall be done before any playbook execution, without mixing anything else.
Same for infrastructure variables (servers, etc).

runnable = playbook + variables + host

* Authentication

rsa key

* Context

Only two thing on the server :

    - python lib (check which ones)
    - aws-sdk cli

## Execution lifecycle

Example :

```
const playbook = await this.ansibleService.preparePlaybook('computing-create', this.environment, this.deployment);
await playbook.execute();
```

```
export interface IPlaybookInputObjects {
    environment: Environment
    deployment?: ServiceDeployment
    lambdaServer?: LambdaServer
}

export class AnsibleService {
    async preparePlaybook(playbookReference: string, environment: Environment, deployment?: ServiceDeployment): Promise<Playbook> {
        let inputs: IPlaybookInputObjects = {environment, deployment};
    
        if(ConfigReader.playbooks.doesPlaybookRequireLambdaServer(playbookReference)) {
            inputs.lambdaServer = await this.infrastructure.allocateLambdaServer('nodejs');
        }
        const playbook = new Playbook(playbookReference, inputs, this.interactive);
        await playbook.ready;
        return playbook;
    }
}
```


## Variables

All variables are exported in `inventories/hosts` and `vars/default.yml`, then are used by `templates/*`.
