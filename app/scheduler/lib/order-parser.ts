import { Order } from '@entities/order';

export class OrderParser {
    constructor(order: Order) {
        console.log('parseOrder', order);
    }
}
