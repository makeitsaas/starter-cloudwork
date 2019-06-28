import { MongoDBPersistence } from 'workflow-es-mongodb';
import { IPersistenceProvider } from 'workflow-es';

export const workflowPersistenceLoader = async function(): Promise<IPersistenceProvider> {
    let mongoPersistence = new MongoDBPersistence("mongodb://root:password@127.0.0.1:27017/workflow-node?authSource=admin");
    await mongoPersistence.connect;
    return mongoPersistence;
};
