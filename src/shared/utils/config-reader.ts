import * as yaml from 'js-yaml';

const fs = require('fs');

// const untrusted_code = '"toString": !<tag:yaml.org,2002:js/function> "function (){very_evil_thing();}"';
// I'm just converting that string, what could possibly go wrong?
// const hack = yaml.load(untrusted_code) + '';
const vaultTypesConfig = yaml.safeLoad(fs.readFileSync(`config/playbooks/vault-types-variables.yml`, 'utf8'));
const playbooksConfig = yaml.safeLoad(fs.readFileSync(`config/playbooks/playbooks.yml`, 'utf8'));
const playbooks = fs.readdirSync('ansible/playbooks');  // do someting to check if available playbooks match with config

for(let key in playbooksConfig) {
    if(!playbooksConfig[key].inputs) {
        playbooksConfig[key].inputs = [];
    }
    if(!playbooksConfig[key].variables) {
        playbooksConfig[key].variables = [];
    }
}


export interface SinglePlaybookConfig {
    inputs: ('environment' | 'service-deployment' | 'lambda-server')[];
    variables: ({ key: string, required: boolean })[]
}

export const ConfigReader = {
    sequenceBlueprint: (action: string): any => {
        return yaml.safeLoad(fs.readFileSync(`config/sequence-blueprint/${action}.yml`, 'utf8'));
    },
    playbooks: {
        getKeys: (): string[] => {
            return Object.keys(playbooksConfig);
        },
        getConfig: (key: string): SinglePlaybookConfig => {
            if (!playbooksConfig[key])
                throw new Error('No config for playbook');
            return playbooksConfig[key];
        },
        getVariableVaultType: (key: string): ('deployment' | 'environment') => {
            const environmentVaultVariables = vaultTypesConfig.environment;
            const serviceDeploymentVaultVariables = vaultTypesConfig.deployment;
            if (environmentVaultVariables.indexOf(key) !== -1) {
                return 'environment';
            } else if (serviceDeploymentVaultVariables.indexOf(key) !== -1) {
                return 'deployment';
            } else {
                throw new Error(`Variable '${key}' has no assigned vault type`);
            }
        },
        doesPlaybookRequireLambdaServer: (key: string): boolean => {
            const config = ConfigReader.playbooks.getConfig(key);
            return config.inputs.indexOf('lambda-server') !== -1
        }
    }
};
