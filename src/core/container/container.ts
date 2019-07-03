import { dbMainLoader, vaultDbLoader } from '@databases';
import { Connection, Repository } from 'typeorm';
import { FakeDelay } from '@fake';

// For the moment, container is a singleton (not managed by inversify). Aim is to use inversify\ContainerModule and manage top-container for the app
console.log('CONTAINER INIT');

export interface IContainer {
    ready: Promise<any>
    databases: {
        main: Connection
        vault: Connection
    },
    services: {}
}

class ContainerClass implements IContainer {
    public ready: Promise<any>;
    public databases: {
        main: Connection
        vault: Connection
    };
    public services: {}
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

export const Container: IContainer = ContainerBuilder();
