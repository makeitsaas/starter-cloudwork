const Ansible = require('node-ansible');
const fs = require('fs');
const keyPath = 'keys/server-key';
var privateKey = fs.readFileSync(keyPath,'utf8')

var playbook = new Ansible.Playbook().playbook('../ansible/deploy-env').privateKey(keyPath).user('ubuntu');

playbook.on('stdout', function(data) { console.log('>', data.toString()); });
playbook.on('stderr', function(data) { console.log(data.toString()); });

var promise = playbook.exec();
promise.then(function(successResult) {
  console.log(successResult.code); // Exit code of the executed command
  console.log(successResult.output) // Standard output/error of the executed command
}, function(error) {
  console.error(error);
})
