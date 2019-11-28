import { _EM_, em } from '@decorators';
import { Order } from '@entities';
import { EntityManager } from 'typeorm';

export class OrderService {
    @em(_EM_.deployment)
    private em: EntityManager;

    getOrderById(orderId: string|number): Promise<Order> {
        return this.em.getRepository(Order).findOneOrFail({
            where: {
                id: orderId
            }
        })
    }
}
