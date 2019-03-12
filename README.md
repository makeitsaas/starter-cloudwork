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


**Pense bête :** Pour la fin, 
* lister de manière explicite les commandes `ansible` + `npm run` et la configuration
minimale pour éviter de se retrouver dans l'embarras
* remonter directement les parties clés du script (déploiement d'un service, loop sur les services, listing du reste)
* diagrammes de flux sur les processus clés
* prévoir des tests pour chaque commandes, avec un environnement et des path dédiés (genre deploy service /srv/test-tmp, test_db_tmp, ...)