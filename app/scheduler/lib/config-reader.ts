import * as yaml from 'js-yaml';
const fs = require('fs');

// const untrusted_code = '"toString": !<tag:yaml.org,2002:js/function> "function (){very_evil_thing();}"';
// I'm just converting that string, what could possibly go wrong?
// const hack = yaml.load(untrusted_code) + '';

export const ConfigReader = {
    sequenceBlueprint: (action: string): any => {
        return yaml.safeLoad(fs.readFileSync(`config/sequence-blueprint/${action}.yml`, 'utf8'));
    }
};
