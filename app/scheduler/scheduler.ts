import { Order } from '@entities/order';
import { OrderParser } from './lib/order-parser';

export class Scheduler {
    public parseOrder(id: string) {
        const o = new Order(id);
        return new OrderParser(o);
    }
}
