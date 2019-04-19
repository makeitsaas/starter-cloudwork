require('dotenv').config();
const program = require('commander');
const log = require('../src/modules/logger/logger')('environment-drop');
const {Order} = require('../src/entities/order');
const Environment = require('../src/entities/environment');
const singleServiceDropOrganizer = require('../src/services/single-service-drop');
const proxyRefreshService = require('../src/services/refresh-proxy');

program
    .option('--order-id <orderId>')
    .parse(process.argv);

const orderId = program.orderId;

if(!orderId) {
    console.error('--env-id is required!');
    process.exit(1);
}

let order = new Order(orderId);
let orderSpecs = order.exportSpecs();
console.log('order specs', orderSpecs);

if(orderSpecs.action !== "drop") {
    console.error('not a "drop" order!');
    process.exit(1);
}

let environment = retrieveCurrentEnvironmentState(orderSpecs.environmentId);
log('ready to delete');

enableMaintenanceMode()
    .then(() => {
        // drop services
        return loopOnServices(orderSpecs.services)
            .then(({dropped}) => log('services stats', {dropped}))
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
        // delete domain from proxy
    })
    .then(() => {
        // delete domain from proxy
    })
    .then(() => {
        // return to normal
        return disableMaintenanceMode();
    })
    .then(() => {
        // clean vault & server ports
    })
    .catch((e) => {
        log('Not everything successful', e);
    });


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

function loopOnServices(services) {

    let dropPromises = services.map(service => singleServiceDropOrganizer(order.getAbsoluteDirectory(), environment, service));

    log('loop on services', {drop: dropPromises.length});
    return Promise.all(dropPromises).then(drops => {
        return {
            dropped: drops.length
        };
    });
}

function retrieveCurrentEnvironmentState(environmentId) {
    // How the environment is currently set
    log('retrieve current environment configuration');
    const currentEnvironment = new Environment(environmentId);
    log('retrieve current environment configuration', currentEnvironment);

    return currentEnvironment;
}
