import "reflect-metadata";
import { config } from 'dotenv';
import { loadMode } from './mode/load-mode';
import { generateSummaryReport } from '../providers/summerize';

export const loadConfig = () => {
    console.log('load config');
    config();   // run this before importing other modules
    loadMode();
    // AWS.config.update({region: 'eu-central-1'});
    console.log(generateSummaryReport());
};
