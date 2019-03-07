//const Ansible = require('node-ansible');
const Ansible = require('../modules/node-ansible/index');
const fs = require('fs');
const keyPath = 'keys/server-key';
var privateKey = fs.readFileSync(keyPath,'utf8'); // check here if key exists => handle error

var playbook = new Ansible.Playbook()
                    .playbook('../ansible/deploy-single')
                    .inventory('inventories/dev')
                    .privateKey(keyPath)
                    .user('ubuntu');

playbook.on('stdout', function(data) { process.stdout.write('.'); });
playbook.on('stderr', function(data) { process.stdout.write('x'); });
//playbook.on('stdout', function(data) { console.log('>', data.toString()); });
//playbook.on('stderr', function(data) { console.log('>', data.toString()); });

var promise = playbook.exec();
// promise.then(function(successResult) {
//   console.log("\ncode :",successResult.code, "\n"); // Exit code of the executed command
//   console.log(successResult.parsed) // Standard output/error of the executed command
// }, function(error) {
//   console.error(error);
// })

promise.catch(e => e).then(function(stats) {
  console.log("\ncode :",stats.code, "\n"); // Exit code of the executed command
  stats.recap && console.log(stats.recap, "\n"); // Exit code of the executed command
  console.log(stats.parsed) // Standard output/error of the executed command
});
