# Example distributed application

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
