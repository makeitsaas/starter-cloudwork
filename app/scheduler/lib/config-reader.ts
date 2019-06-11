import * as yaml from 'js-yaml';

const fs = require('fs');

// const untrusted_code = '"toString": !<tag:yaml.org,2002:js/function> "function (){very_evil_thing();}"';
// I'm just converting that string, what could possibly go wrong?
// const hack = yaml.load(untrusted_code) + '';

const playbooksConfig = yaml.safeLoad(fs.readFileSync(`config/playbooks/playbooks.yml`, 'utf8'));
const playbooks = fs.readdirSync('ansible/playbooks');

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
        }
    }
};

export interface SinglePlaybookConfig {
    inputs: ('environment' | 'service-deployment')[];
    variables: ({ key: string, required: boolean })[]
}
