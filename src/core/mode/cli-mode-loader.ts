import { CommanderStatic } from 'commander';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as AWS from 'aws-sdk';

/**
 * Documentation : Mode configuration
 *
 * Description : a configuration for environment type specificities (production, test, local, ...)
 *
 * Configuration location : config/mode/{env}.mode.yml
 *
 */

const MODES_LIST = [
    'production',
    'test',
    'local'
];

interface IModeConfig {
    production: boolean
    executePlaybooks: boolean
}

export class InvalidMode extends Error {
}

export let ModeConfig: IModeConfig;

export const ModeLoader = (program?: CommanderStatic) => {
    if(ModeConfig) {
        // already done
        return;
    }

    AWS.config.update({region: 'eu-central-1'});

    if (program && program.mode) {
        process.env.MODE = program.mode;
    }

    if (process.env.MODE && MODES_LIST.indexOf(process.env.MODE) === -1) {
        throw new InvalidMode(`Config mode value is invalid ${process.env.MODE || '-'}`);
    }

    if (!process.env.MODE) {
        process.env.MODE = 'production';
    }

    const configFileName = `${process.env.MODE}.mode.yml`,
        configDirPath = `config/mode`;
    ModeConfig = yaml.safeLoad(fs.readFileSync(`${configDirPath}/${configFileName}`, 'utf8'));
    console.log('ModeConfig', ModeConfig, "\n\n");
};
