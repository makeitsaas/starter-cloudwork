require('dotenv').config();
const program = require('commander');
const log = require('../src/modules/logger/logger')('environment-create');
const Order = require('../src/entities/order');
const singleServiceDeployerService = require('../src/services/single-service-deployer');
const Environment = require('../src/entities/environment');

program
    .option('--env-id <envId>')
    .parse(process.argv);

const envId = program.envId;

if(!envId) {
    console.error('--env-id is required!');
    process.exit(1);
}

let order = initOrder();
let desiredConfiguration = loadOrderSpecifications(order);
let currentEnvironment = retrieveCurrentEnvironmentState(desiredConfiguration.environmentId);
let processingDirectory = prepareProcessingDirectory();
let currentServices = currentEnvironment._meta.services || [];
let newServices = desiredConfiguration.services;

enableMaintenanceMode()
    .then(() => {
        return loopOnServices(currentServices, newServices)
                .then(({created, updated, unchanged}) => log('services stats', {created, updated, unchanged}));
    })
    .catch((e) => {
        // if service deployment error, then recover
        // databases recover : backup required before update
        // computing recover : checkout source at previous-deployment-commit (ou deploy in another directory => better)
    })
    .then(() => {
        // update main config
        updateProxy();
        updateCertificates();
    })
    .then(() => {
        // clean environment
        return deleteDeprecatedServices(currentServices, newServices)
                .then(({dropped}) => log('dropped services stats', {dropped}));
    })
    .then(() => {
        // return to normal
        return disableMaintenanceMode();
    });

function initOrder() {
    log('init');
    return new Order('000000000000001');
}

function loadOrderSpecifications(order) {
    // How we want the environment to be set
    log('load order specifications');
    order.loadSpecs();
    let specs = order.get('specs'),
        environmentId = specs.environment_id,
        services = specs.services,
        domains = specs.domains;
    log('specs found', specs);

    return {specs, environmentId, services, domains};
}

function retrieveCurrentEnvironmentState(environmentId) {
    // How the environment is currently set
    log('retrieve current environment configuration');
    const currentEnvironment = new Environment(environmentId);
    log('currentEnvironment', currentEnvironment);
    return currentEnvironment;
}

function prepareProcessingDirectory() {
    // Directory where we prepare var_files and will store logs
    log('prepare order session (nothing for the moment)');
    //log('                 => directory');
    //log('                 => things to do (services sub-tasks)');
    //log('                 => variables');
    //log('                 => config files');
    //log('prepare future environment state');    // in case there is an error, check it since the beginning

    return {};
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
    let servicesToCreate = servicesAfter.filter(n => servicesBefore.filter(o => o.id === n.id).length === 0);
    let servicesToUpdate = servicesAfter.filter(n => servicesBefore.filter(o => o.id === n.id).length > 0);
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
    return singleServiceDeployerService(order.getDirectory(), currentEnvironment, service);
}

function updateProxy() {
    log('generate proxy routing configuration');
    log('touch proxy reload for this env');
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
    let promise = new Promise((resolve, reject) => {
        setTimeout(() => {
            log('mock service delete', service);
            resolve(1);
        }, 100 + Math.random() * 100);
    });

    return promise;
}
