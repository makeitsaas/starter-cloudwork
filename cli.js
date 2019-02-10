#!/usr/bin/env node

/**
 * Module dependencies.
 */

var program = require('commander');

program
  .version('0.1.0')
  .option('-D, --deploy', 'Deploy')
  .option('-S, --service [vars_file]', 'Generate config')
  .option('-P, --proxy [env]', 'Generate config')
  .parse(process.argv);

if(program.service) {
  console.log('generate config file for service', program.service);
}

if(program.proxy) {
  console.log('generate proxy config for env', program.proxy);
}

if(program.deploy) {
  console.log('launch deploy');
  require('./lib/deploy')
}
