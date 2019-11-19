import { AwsSqsOrders } from '../aws/aws-sqs-orders';
import { CustomOrders } from '@config';

const sqsClient = new AwsSqsOrders();

export const CliPushOrderHandler = (pushOrderId?: string) => {
    const orderId = pushOrderId && !isNaN(parseInt(pushOrderId)) ? parseInt(pushOrderId) : 1;
    return sqsClient.push(CustomOrders[orderId]);
};
