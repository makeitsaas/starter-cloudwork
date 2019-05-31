// prend le yml en entrée d'une commande et crée la séquence appropriée
// diff dans une lib à part ?

import { Order } from '@entities/order';
import { Sequence } from '@entities';

export const orderToSequence = (order: Order): Sequence => {
    const seq = new Sequence();

    return seq;
};
