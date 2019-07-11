import { dbMainLoader, vaultDbLoader } from '@databases';
import { Connection } from 'typeorm';

// For the moment, container is a singleton (not managed by inversify). Aim is to use inversify\ContainerModule and manage top-container for the app

class ContainerClass {
    public ready: Promise<any>;
    public databases: {
        main: Connection
        vault: Connection
    };
    private services: {
        [key: string]: any
    } = {};
    public getService(metadata: any) {
        if(!this.services[metadata.name]) {
            this.services[metadata.name] = new metadata();
        }
        return this.services[metadata.name];
    }
}

const ContainerBuilder = () => {
    const container = new ContainerClass();

    container.ready = Promise.all([
        dbMainLoader,
        vaultDbLoader
    ]).then(([dbMainConnection, dbVaultConnection]) => {
        container.databases = {
            main: dbMainConnection,
            vault: dbVaultConnection
        };
    });

    return container;
};

export const Container: ContainerClass = ContainerBuilder();
