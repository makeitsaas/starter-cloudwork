import { loadConfig } from './config-loader';

if (! process.env.__config_loaded__) {
    loadConfig();
    process.env.__config_loaded__ = 'loaded';
}
