import { Main } from '../../../src/main';
import { CustomOrders } from '@config';
import { DefaultUser } from '../../../config/default-user';

export const CliOrderHandler = (orderUuid: string, app: Main): Promise<any> => {
    return app.handleYMLOrder(orderUuid, DefaultUser, CustomOrders[parseInt(orderUuid)]);
};
