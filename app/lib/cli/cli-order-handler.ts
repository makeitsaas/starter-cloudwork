import { Main } from '../../../src/main';

export const CliOrderHandler = (order: string, app: Main): Promise<any> => {
    return app.handleYMLOrder(order);
};
