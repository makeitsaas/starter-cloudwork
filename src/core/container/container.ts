import { dbMainLoader, vaultDbLoader } from '@databases';
import { Connection, Repository } from 'typeorm';

export interface IContainer {
    databases: {
        main: Promise<Connection>
        vault: Promise<Connection>
    },
    services: {}
}

class ContainerClass implements IContainer {
    public databases = {
        main: dbMainLoader,
        vault: vaultDbLoader
    };
    public services: {}
}

const ContainerBuilder = () => {
    return new ContainerClass();
};

export const Container: IContainer = ContainerBuilder();
