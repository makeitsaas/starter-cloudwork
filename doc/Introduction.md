# Introduction

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
