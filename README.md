# Deployer

Prepares and runs complex ansible playbooks.

## Getting started
```
npm run deploy
npm run adhoc
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
