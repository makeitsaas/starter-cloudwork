import { Order } from '@entities';
import { FakeOrders } from '../fake/fake-orders';

export class Scheduler {
    public parseOrder(id: number) {
        const o = new Order(FakeOrders[id]);
        return o;
    }
}
