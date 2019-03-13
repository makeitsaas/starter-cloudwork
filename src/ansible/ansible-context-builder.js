// creates all necessary context for an ansible script execution, with `ansible-client.js` and manually with `ansible-playbook`
// inventory/varfile/playbook

const fs = require('fs');
const YAML = require('yamljs');

module.exports = function(execDirectory, inventory, vars, playbookName) {

    console.log("execDirectory, inventory, vars, playbookName");
    console.log(execDirectory, inventory, vars, playbookName);

    writeInventoryFile(execDirectory, inventory);
    writeVarsFile(execDirectory, vars);
    copyPlaybook(execDirectory, playbookName);
    linkPlaybooksDirectory(execDirectory);
    linkTemplatesDirectory(execDirectory);

    return {}
};


function writeInventoryFile(execDirectory, inventory) {
    let inventoryDir = execDirectory + '/inventories',
        inventoryFile = inventoryDir + '/hosts';
    fs.mkdirSync(inventoryDir);
    fs.writeFileSync(inventoryFile, `[daemons]
${inventory.daemons}

[computing]
${inventory.computing}`);
}

function writeVarsFile(execDirectory, vars) {
    let varsDir = execDirectory + '/vars',
        varsFile = varsDir + '/default.yml';
    fs.mkdirSync(varsDir);
    console.log(vars._toYAML());
    fs.writeFileSync(varsFile, vars._toYAML())
}

function copyPlaybook(execDirectory, playbookName) {
    fs.copyFileSync(`${__dirname}/commands/${playbookName}.yml`, execDirectory + '/root-playbook.yml');
}

function linkPlaybooksDirectory(execDirectory) {
    fs.symlinkSync(`${__dirname}/commands/playbooks`, `${execDirectory}/playbooks`);
}

function linkTemplatesDirectory(execDirectory) {
    fs.symlinkSync(`${__dirname}/commands/templates`, `${execDirectory}/templates`);
}