import { Order } from '@entities';
import { FakeOrders } from '../fake/fake-orders';

export class Scheduler {
    public parseOrder(id: number) {
        const o = new Order(FakeOrders[id]);
        return o;
    }
}



/*
const s = new Scheduler();
const o = s.parseOrder(1);
connection.transaction(transactionalEntityManager => {
    let em = transactionalEntityManager;
    return em.save(o).then(savedOrder => {
        const seq = new Sequence(savedOrder);
        return seq.saveDeep(em);
    });
});
*/
