# Example distributed application

Todos :

* Supprimer ansible/
* Packager ansible-package
* Clarifier la config (database) et gestion des modules

                 (context: repositories)
workflow => task => action => services => adapters => libs (ansible, aws-sdk)

Three ways to do things :
- cli 
- launch a worker that simply consumes a queue
- launch a worker that processes a distributed workflow

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
npm run cli
```

## Commands

```
# one to push the new order
npm run cli -- --someParameter=value

# todo : one example to show a consumer worker
npm run worker-consumer

# one example to show an "action" worker
npm run worker-action
```


## Context loading

```
dotenv.config();
ModeLoader();
AWS.config.update({region: 'eu-central-1'});
```

## DI

Use decorators for injection (`@decorators`)

* `em` : entity manager
* `services`
* ...

PREREQUISITE : app shall be ready

```
const app = new Main();
app.ready.then(() => {
    // do everything you want
});
```

## Tips

To install docker using ansible

Tutorial : https://www.digitalocean.com/community/tutorials/how-to-use-ansible-to-install-and-set-up-docker-on-ubuntu-18-04
Playbook : https://github.com/do-community/ansible-playbooks/blob/master/docker_ubuntu1804/playbook.yml
