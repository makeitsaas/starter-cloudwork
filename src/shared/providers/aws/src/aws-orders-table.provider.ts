import { OrderTableProviderInterface } from '@custom-modules/providers/abstract/order-table-provider.interface';
import { DynamoClient } from './lib/dynamo-db';
import { DYNAMODB_TABLE_NAME } from '@custom-modules/providers/aws/config/dynamo-order';
import { AwsSqsOrderInterface } from '../../../../../apps/worker-sqs/lib/aws-sqs-order-interface';

export class AwsOrdersTableProvider implements OrderTableProviderInterface {
    async updateReport(orderUuid: string, userUuid: string, newReport: any) {
        console.log('newReport', orderUuid, newReport);
        const orderTable = new DynamoClient(DYNAMODB_TABLE_NAME);
        await orderTable.update(orderUuid, userUuid, newReport);
    }
    async createOrder(sqsOrder: AwsSqsOrderInterface) {
        console.log('sqsOrder', sqsOrder);
        const orderTable = new DynamoClient(DYNAMODB_TABLE_NAME);
        await orderTable.create(sqsOrder);
    }
}
