import * as yaml from 'js-yaml';

const fs = require('fs');

// const untrusted_code = '"toString": !<tag:yaml.org,2002:js/function> "function (){very_evil_thing();}"';
// I'm just converting that string, what could possibly go wrong?
// const hack = yaml.load(untrusted_code) + '';

const vaultTypesConfig = yaml.safeLoad(fs.readFileSync(`config/playbooks/vault-types-variables.yml`, 'utf8'));
const playbooksConfig = yaml.safeLoad(fs.readFileSync(`config/playbooks/playbooks.yml`, 'utf8'));
const playbooks = fs.readdirSync('ansible/playbooks');  // do someting to check if available playbooks match with config

export const ConfigReader = {
    sequenceBlueprint: (action: string): any => {
        return yaml.safeLoad(fs.readFileSync(`config/sequence-blueprint/${action}.yml`, 'utf8'));
    },
    playbooks: {
        getKeys: (): string[] => {
            return Object.keys(playbooksConfig);
        },
        getConfig: (key: string): SinglePlaybookConfig => {
            if(!playbooksConfig[key])
                throw new Error('No config for playbook');
            return playbooksConfig[key];
        },
        getVariableVaultType: (key: string): ('deployment'|'environment') => {
            const environmentVaultVariables = vaultTypesConfig.environment;
            const serviceDeploymentVaultVariables = vaultTypesConfig.deployment;
            if(environmentVaultVariables.indexOf(key) !== -1) {
                return 'environment';
            } else if(serviceDeploymentVaultVariables.indexOf(key) !== -1) {
                return 'deployment';
            } else {
                throw new Error('Variable has no assigned vault type');
            }
        }
    }
};

export interface SinglePlaybookConfig {
    inputs: ('environment' | 'service-deployment')[];
    variables: ({ key: string, required: boolean })[]
}
