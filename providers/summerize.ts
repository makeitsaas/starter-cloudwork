export const generateSummaryReport = () => {
    return {
        database: {
            entitiesPattern: 'src/domains/**/entities/*.ts',
            orm: 'TypeORM'
        },
        workflow: {
            lib: 'workflow-es',
            queue: 'redis://...',
            locks: 'redis://...',
            database: 'mongo://...'
        },
        stateEmitter: {
            outputQueue: 'redis://...'
        },
        aws: {
            todo: 'some day'
        }
    }
};
