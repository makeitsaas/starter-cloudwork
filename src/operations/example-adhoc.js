const fs = require('fs');
const keyPath = 'keys/server-key';
var privateKey = fs.readFileSync(keyPath,'utf8')

var Ansible = require('node-ansible');
var command = new Ansible.AdHoc().module('shell').hosts('test').privateKey(keyPath).user('ubuntu').args("echo 'hello'");

var promise = command.exec();
promise.then(function(successResult) {
  console.log(successResult.code); // Exit code of the executed command
  console.log(successResult.output) // Standard output/error of the executed command
}, function(error) {
  console.error(error);
})
