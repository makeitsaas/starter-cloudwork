import { OrderTableProviderInterface } from '@custom-modules/providers/abstract/order-table-provider.interface';
import { DynamoClient } from './lib/dynamo-db';
import { DYNAMODB_TABLE_NAME } from '@custom-modules/providers/aws/config/dynamo-order';

export class AwsOrdersTableProvider implements OrderTableProviderInterface {
    async updateReport(orderUuid: string, newReport: any) {
        console.log('newReport', orderUuid, newReport);
        const orderTable = new DynamoClient(DYNAMODB_TABLE_NAME);
        await orderTable.update(orderUuid, newReport);
    }
}
