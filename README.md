# Deployer

Prepares and runs complex ansible playbooks.

## Getting started
```
npm run deploy
npm run adhoc
npm run environment:create -- --order-id=1
```

### Notes

Fix in `node-ansible` lib (`addPathParam` function) :
```
return this.addParamValue(commandParams, '"' + this.config[param] + '"', flag);
```

Need to remove double quotes (then careful about paths)
```
return this.addParamValue(commandParams, '' + this.config[param] + '', flag);
```
