# Notes (jumble)


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

## Notes

### TypeORM

* Saving database lazy relations
Using TypeORM to manage relations, you can load them in two way 
([see doc](https://github.com/typeorm/typeorm/blob/master/docs/eager-and-lazy-relations.md)) : eager and lazy

By default, only setting up @ManyToOne, @ManyToMany, @OneToMany only adds the constraint in database, but data shall be
fetched separately.

**Using eager option**

```
@ManyToOne(type => Server, { cascade: true, eager: true })
server: Server;
```

Foreign key will always be loaded at the same time the entity is.

**Using lazy relations**

Replace type definition by a promise of this type 

```
@ManyToOne(type => Server, { cascade: true })
server: Promise<Server>;
```

In this case, attribute will always be defined as a promise, returning the expected relation.

Beware ! When saving a lazy relation, two mandatory conditions shall be fulfilled :
- the relation shall already have been saved
- the value shall be a promise of the instance

Meaning :
```
const em = connection.manager;
const server = new Server();
const allocation = new Allocation();

await em.save(server);                          // Save relation before
allocation.server = Promise.resolve(server);    // Set relation as a promise of the instance
await em.save(allocation);                      // Then save final entity

// ok then
```

If you don't do so, there would be no error. But relation will not be saved at all :/


## CLI todo

```
/**
 * TODO :
 * - Execute playbooks for real
 * - gather/store data from playbooks
 * - list possible behaviors
 * - make diagrams for these possible behaviors (processes, modules hierarchy, ...)
 * - create servlet to take external orders (network rules => no authentication)
 *      - orders create/update environment
 *      - orders delete environment
 *      - orders service recovering
 *      - gather workflow reports
 *      - response => status + workflow id
 * - deploy spa & cdn
 * - data pipelines + ML (step = read/transform/save mongo documents)
 * - BP : mis + architecture-ready-to-use
 */
```
