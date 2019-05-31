import { Scheduler } from './scheduler/scheduler';
import { config } from 'dotenv';
import "reflect-metadata";
import { dbLoader } from './repository/databases/infrastructure-database';

config();

dbLoader.then(connection => {
    console.log('connection successful');

    const s = new Scheduler();
    const o = s.parseOrder(1);

    if (connection) {
        connection.transaction(transactionalEntityManager => {
            return transactionalEntityManager
                .save(o)
                .then(savedOrder => {
                    const seq = s.convertOrderToSequence(savedOrder);
                    seq.orderId = `${savedOrder.id}`;
                    seq.sequenceType = `environment-update`;
                    console.log('saved order', savedOrder.id);
                    return transactionalEntityManager.save(seq).then(savedSeq => {
                        console.log('seq.createdAt', savedSeq.createdAt);
                        // throw new Error('Voluntaree pazreoijzrgpizoeughzqomi');
                    });
                });
        });

    }
});
