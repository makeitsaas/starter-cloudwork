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

**Prerequisites :**
- some
- things

**Usage :**
```
npm install
npm run cli -- --order=1 --mode=production
```



