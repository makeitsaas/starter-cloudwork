import { AwsSqsOrders } from '../aws/aws-sqs-orders';
import { CustomOrders } from '@config';
import { AwsSqsOrderInterface } from '../aws/aws-sqs-order-interface';
import { DefaultUser } from '../../../config/default-user';
import { AwsOrdersTableProvider } from '@custom-modules/providers/aws';

const uuid = require('uuid/v1');

const sqsClient = new AwsSqsOrders();
const awsService = new AwsOrdersTableProvider();

export const CliPushOrderHandler = (pushOrderId?: string) => {
    const orderId = pushOrderId && !isNaN(parseInt(pushOrderId)) ? parseInt(pushOrderId) : 1;
    const order: AwsSqsOrderInterface = {
        UserUuid: DefaultUser,
        OrderUuid: uuid(),
        OrderContent: CustomOrders[orderId]
    };
    // do something about it, it is dirty => MUST DO : wrap order creation properly
    return awsService
        .createOrder(order)
        .then(() => sqsClient.push(JSON.stringify(order)));
};
