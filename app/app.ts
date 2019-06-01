import { Scheduler } from './scheduler/scheduler';
import { config } from 'dotenv';
import "reflect-metadata";
import { dbLoader } from './repository/databases/infrastructure-database';
import { Sequence } from '@entities';

config();

// For the moment, we create a sequence from a freshly saved order

dbLoader.then(connection => {
    console.log('connection successful');

    const s = new Scheduler();
    const o = s.parseOrder(1);

    if (connection) {
        connection.transaction(transactionalEntityManager => {
            let em = transactionalEntityManager;
            return em.save(o).then(savedOrder => {
                const seq = new Sequence(savedOrder);
                return seq.saveDeep(em);
            });
        });



    }
});
