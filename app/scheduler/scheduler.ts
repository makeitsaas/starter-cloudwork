import { Order, Sequence } from '@entities';
import { orderToSequence } from './lib/order-to-sequence';

export class Scheduler {
    public parseOrder(id: number) {
        const o = new Order(exampleOrders[id]);
        return o;
    }
    public convertOrderToSequence(o: Order): Sequence {
        return orderToSequence(o);
    }
}


const order1 = `
action: "update"
environment_id: "3"
domains:
  - manager-api.lab.makeitsaas.com
services:
  - id: "6"
    path: /auth
    repo_url: 'https://github.com/makeitsaas/makeitsaas-auth-instance'
  - id: "7"
    path: /
    repo_url: 'https://github.com/Duwab/makeitsaas-manager-api'
`;

const exampleOrders: {[id: number]: string} = {
    1 : order1
};
