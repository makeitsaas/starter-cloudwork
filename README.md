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

## Requirements

```
npm -v # 6.12.1
node -v # v13.1.0
ansible --version # ansible 2.9.1
# and makeitsaas/devkit
```

## Getting Started

**Prerequisites :**
- some
- things

**Usage :**
```
npm install
npm run cli -- --order=1 --mode=production
```

## Fresh Things

Ability to consume orders queue from sqs, and execute workflows with multiple sessions. 
If everything is configured properly, open 3 tabs in your terminal and paste one of the following lines in each of them :
```
# one to push the new order
npm run cli -- --pushOrder=3

# one to listen and handle the order
npm run worker-orders

# one to add another workflow worker
npm run worker-workflow
```


## Context loading

```
dotenv.config();
ModeLoader();
AWS.config.update({region: 'eu-central-1'});
```
