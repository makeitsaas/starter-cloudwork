require('dotenv').config();
const program = require('commander');
const log = require('../src/modules/logger/logger')('environment-create');
const {Order} = require('../src/entities/order');
const Environment = require('../src/entities/environment');
const singleServiceDeployerService = require('../src/services/single-service-deployer');
const proxyRefreshService = require('../src/services/refresh-proxy');

program
    .option('--order-id <orderId>')
    .parse(process.argv);

const orderId = program.orderId;

if(!orderId) {
    console.error('--order-id is required!');
    process.exit(1);
}

let order = new Order(orderId);
let desiredConfiguration = order.exportSpecs();
log('desiredConfiguration', desiredConfiguration);
let currentEnvironment = retrieveCurrentEnvironmentState(desiredConfiguration.environmentId);
let currentServices = currentEnvironment.services;
let newServices = desiredConfiguration.services;





/**
 * Main Process here
 */
enableMaintenanceMode()
    .then(() => {
        // update services 1 by 1
        return loopOnServices(currentServices, newServices)
            .then(({created, updated, unchanged}) => log('services stats', {created, updated, unchanged}))
            .catch((e) => {
                log('loopOnServices error', e);
                order._onError(e);
                throw e;
                // if service deployment error, then recover
                // databases recover : backup required before update
                // computing recover : checkout source at previous-deployment-commit (ou deploy in another directory => better)
            });
    })
    .then(() => {
        // update main config
        return  Promise.resolve()
            .then(() => updateProxy())
            .then(() => updateCertificates())
            .catch(e => {
                log('main config update error', e);
                order._onError(e);
                throw e;
            })
    })
    .then(() => {
        // clean environment
        return deleteDeprecatedServices(currentServices, newServices)
                .then(({dropped}) => log('dropped services stats', {dropped}));
    })
    .then(() => {
        // return to normal
        order._onSuccess();
        return disableMaintenanceMode();
    })
    .catch((e) => {
        log('Not everything successful', e);
    });





/**
 * Utils
 */

function retrieveCurrentEnvironmentState(environmentId) {
    // How the environment is currently set
    log('retrieve current environment configuration');
    const currentEnvironment = new Environment(environmentId);
    log('currentEnvironment', currentEnvironment);
    return currentEnvironment;
}

function enableMaintenanceMode() {
    // stalled request during maintenance, 503 if too long (not a real timeout, but a maintenance notice)
    log('enable maintenance mode');

    return new Promise(resolve => {
        setTimeout(() => resolve(true), 1000);
    });
}

function disableMaintenanceMode() {
    // stalled request during maintenance, 503 if too long (not a real timeout, but a maintenance notice)
    log('disable maintenance mode');

    return Promise.resolve(true);
}

function loopOnServices(servicesBefore, servicesAfter) {
    let {create, update} = tidyServices(servicesBefore, servicesAfter);

    let createPromises = Promise.all(create.map(s => createService(s))).then(list => list.filter(result => result).length);
    let updatePromises = Promise.all(update.map(s => updateService(s))).then(list => list.filter(result => result).length);

    log('loop on services', {create: create.length, update: update.length});
    return Promise.all([createPromises, updatePromises]).then(statsByAction => {
        return {
            created: statsByAction[0],
            updated: statsByAction[1],
            unchanged: 0
        };
    });
}

function tidyServices(servicesBefore, servicesAfter) {
    // n => new service | o => old service
    let servicesToCreate = servicesAfter.filter(n => !currentEnvironment._getService(n.id));
    let servicesToUpdate = servicesAfter.filter(n => currentEnvironment._getService(n.id));
    let servicesToDelete = servicesBefore.filter(o => servicesAfter.filter(n => o.id === n.id).length === 0);

    return {
        'create': servicesToCreate,
        'update': servicesToUpdate,
        'drop': servicesToDelete
    };
}

function createService(service) {
    return updateService(service);
}

function updateService(service) {
    return singleServiceDeployerService(order.getAbsoluteDirectory(), currentEnvironment, service);
}

function updateProxy() {
    log('generate proxy routing configuration');
    log('touch proxy reload for this env');
    currentEnvironment._setDomains(desiredConfiguration.domains);
    return proxyRefreshService(order.getAbsoluteDirectory(), currentEnvironment);
}

function updateCertificates() {
    log('update certificates');
}

function deleteDeprecatedServices(servicesBefore, servicesAfter) {
    let {drop} = tidyServices(servicesBefore, servicesAfter);

    let promises = drop.map(s => dropService(s));

    return Promise.all(promises).then(listOfStats => {
        return {
            dropped: listOfStats.length
        };
    });
}

function dropService(service) {
    return new Promise((resolve) => {
        setTimeout(() => {
            log('mock service delete', service);
            resolve(1);
        }, 100 + Math.random() * 100);
    });
}
