import { AnsibleInventory } from '../playbook';
const yaml = require("js-yaml");

export class AnsibleFileBuilder {
    buildVarsFile(vars: any): string {
        return yaml.dump(vars)
    }
    buildInventory(inventory: AnsibleInventory): string {
        let content = '';
        for(let host in inventory) {
            content += `[${host}]\n`;
            inventory[host].map(address => content += `${address}\n`);
            content += '\n';
        }

        return content;
    }
}
