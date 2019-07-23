# Deployer

Prepares and runs complex ansible playbooks.

NodeJS/TypeScript application :
- Input : custom orders, under `.yml` format
- Output : execution of custom ansible scripts


Domains reflected in this repository :
* pipeline : handles business specifications (yml as input, workflow as output)
* infrastructure : allocates all kind of resources
* vault : keeps credentials safe (resources, environment, ...)
* deployment : plans every environment and executes deployment tasks (using Ansible)

Use cases :
- Create a multi-services environment, on shared servers (API + Front, using only repositories urls)
- Perform specific operations on temporary servers (batch, ML, ...)
- Manage existing environments (migrations, update, delete, ...)
- Adapt deployment configurations according to environment type

## Getting Started

### Installation

**Prerequisites :**
- some
- things


### Executing ansible scripts
Via node, or without


## How it works

**What does it do ?**

Basically executes deployment orders (setup environment, update environment, delete environment). 
This includes :
* Parsing order requests
* Dividing orders into multiple steps
* Executing ansible scripts for each step, in a sequential way, gathering information and ability to recover from 
stopped/failed step
* Creating, storing, recovering secrets (passwords for third-party services)
* Getting new resources allocation
* Storing and recovering infrastructure variables (hosts, names, ...)
* Code portability : consume orders from lambda, ec2 or local device
* Code flexibility : ability to execute either one or multiple steps without difficulty
* Check and explain : to ensure scripts robustness, include systematic pre-execution checks and format errors properly 


## Jobs

* Recover secrets configuration
* Recover infrastructure configuration
* Allocate new resources
* Store configuration (create/update/delete)
* Create a database and its associated user
* Drop a database and its associated user
* Create a single service and start it (git clone + pm2 start)
* Update a service and restart it
* Drop a service and stop it
* Add domain configuration and reload proxy
* Update domain configuration and reload proxy
* Drop domain configuration and reload proxy

**Checks :**

* does a database exist ?
* does a database user exist ?
* what is the code version of a service ?
* what is the run version of a service ?
* has proxy been reloaded ?
* is a script in execution right now ?
* when was the last time a script was executed
* are instances available ?
* are instances configured properly ?
* are services inside instances available ?


## Service-Entity (Representational Entity)

Entities that owns methods that can execute complex scripts and update its statuses. Examples :
```
someEnvironement.updateServices();
someService.updateSourceCode();
someService.restartServer();
```

In other words, entities are not just objects or a database representation (like with orm), but have a much wider scope.
They can execute services methods transparently.

This will might require to associate them with infrastructure configuration, secrets and maybe persist their status 

## Getting started
```
npm run deploy
npm run adhoc
npm run environment:create -- --order-id=1
```


## Todos

* explicit listing of key commands + minimal configuration (`ansible-playbook` AND `npm run`)
* explain key parts of a script (service deployment, loops, checks, ...)
* describe processes : I/O, flowcharts, possible cases, errors management, ...
* test scripts, with a dedicated environment and path (/srv/test-tmp, test_db_tmp, ...) => validating that each job is operational


### Notes

Fix in `node-ansible` lib (`addPathParam` function) :
```
return this.addParamValue(commandParams, '"' + this.config[param] + '"', flag);
```

Need to remove double quotes (then careful about paths)
```
return this.addParamValue(commandParams, '' + this.config[param] + '', flag);
```




### V2 
* **servlet :** receives order requests (http, queues)
* **scheduler :** parses orders and rewrites it into a list of jobs
* **runner :** executes jobs using ansible playbooks  
* **repository :** persists configurations  



### Add a new playbook

1. Create root playbook entry point in `ansible/playbooks/{playbook-name}.yml`
2. Add necessary sub-playbooks under `ansible/playbooks/parts` directory
3. Declare playbook in `config/playbooks/`
4. Add missing inventory hosts in ... 
4. Launch `npm run cli -- --ansible -i --mode=local` to see generated playbook
5. Go to freshly created execution directory and try it manually using `ansible-playbook -i inventories/hosts root-playbook.yml`
