require('dotenv').config();
const program = require('commander');
const log = require('../src/modules/logger/logger')('environment-create');
const Order = require('../src/order');

program
    .option('--env-id <envId>')
    .parse(process.argv);

const envId = program.envId;

if(!envId) {
    console.error('--env-id is required!');
    process.exit(1);
}

let order = initOrder();
let currentConfiguration = retrieveCurrentEnvironmentState();
let desiredConfiguration = loadOrderSpecifications(order);
let processingDirectory = prepareProcessingDirectory();
let currentServices = currentConfiguration.services;
let newServices = desiredConfiguration.services;

let maintenanceOn = enableMaintenanceMode();
//let {updated, deleted, unchanged} = loopOnServices(currentConfiguration.services, desiredConfiguration.services);
enableMaintenanceMode()
    .then(() => {
        return loopOnServices(currentServices, newServices)
                .then(({created, updated, unchanged}) => log('services stats', {created, updated, unchanged}));
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
        services = specs.services,
        domains = specs.domains;
    log('specs found', specs);
    log('required arguments :');
    log('                 => domains : ' + specs.domains.join(', '));
    log('                 => env ' + specs.environment_id);
    log('                 => services (id, path, repo) - ' + services.length);

    return {specs, services, domains};
}

function retrieveCurrentEnvironmentState() {
    // How the environment is currently set
    log('retrieve current environment configuration (everything could be in the vault content)');

    return {services: []};
}

function prepareProcessingDirectory() {
    // Directory where we prepare var_files and will store logs
    log('prepare order session');
    log('                 => directory');
    log('                 => things to do (services sub-tasks)');
    log('                 => variables');
    log('                 => config files');
    log('prepare future environment state');    // in case there is an error, check it since the beginning

    return {};
}

function enableMaintenanceMode() {
    // stalled request during maintenance, 503 if too long (not a real timeout, but a maintenance notice)
    log('enable maintenance mode');

    return Promise.resolve(true);
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
    // db > compute (> proxy)
    //log('services.forEach');
    //log('                 => [local] generate service codeName and hosts');
    //log('                 => [local] generate db codeName');
    //log('                 => [daemons] create DB with USER');
    //log('                 => [local] store db/user create status, names and password, version');
    //log('                 => [computing] clone repo');
    //log('                 => [computing] generate .env');
    //log('                 => [computing] pm2 start service');
    //log('                 => [computing] store namespace, status, version');

    let promise = new Promise((resolve, reject) => {
        setTimeout(() => {
            log('mock service update', service);
            resolve(1);
        }, 1000 + Math.random() * 1000);
    });

    return promise;
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
        }, 1000 + Math.random() * 1000);
    });

    return promise;
}
