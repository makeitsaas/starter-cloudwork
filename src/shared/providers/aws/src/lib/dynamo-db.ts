import * as AWS from "aws-sdk";
import * as DynamoDB from "aws-sdk/clients/dynamodb";
import { DYNAMO_DB_COLUMNS, DYNAMODB_TABLE_NAME } from '@custom-modules/providers/aws/config/dynamo-order';
import parsers from "./parsers";

AWS.config.update({
    region: "eu-central-1"
});

const myDynamo = new AWS.DynamoDB({apiVersion: "2012-08-10"});


export interface DynamoOrder {

}

const scan = () => {
    // const params = {
    //     ExpressionAttributeValues: {
    //         ":userUuid": { S: "test-random-uuid-1234" }
    //     },
    //     KeyConditionExpression: "UserUuid = :userUuid",
    //     ProjectionExpression: DYNAMO_DB_COLUMNS.join(", "),
    //     TableName: DYNAMODB_TABLE_NAME
    // };
    //
    // return new Promise((resolve, reject) => {
    //     DynamoDb.query(params, (err: any, data: any) => {
    //         if (err) {
    //             reject(data);
    //         } else {
    //             const elements = data.Items.map(parseElement);
    //             resolve(elements);
    //         }
    //     });
    // });
};

const create = (userUuid: string, order: string) => {
    // const item = orderItem(userUuid, order);
    //
    // const dynamoParams = {
    //     TableName: DYNAMODB_TABLE_NAME,
    //     Item: item
    // };
    //
    // return new Promise((resolve, reject) => {
    //     DynamoDb.putItem(dynamoParams, (err: any, data: any) => {
    //         if (err) {
    //             reject(err);
    //         } else {
    //             resolve(data);
    //         }
    //     });
    // });
};

// const orderItem = (userUuid: string, order: string) => {
//     return {
//         UserUuid: { S: userUuid },
//         OrderUuid: { S: uuid() },
//         OrderContent: { S: order },
//         OrderReport: { S: `{}` },
//         CreatedAt: { S: NOW() },
//         UpdatedAt: { S: NOW() }
//     };
// };

const NOW = () => {
    return `${new Date()}`;
};

const parseElement = (rawElement: any) => ({
    UserUuid: rawElement.UserUuid.S,
    OrderUuid: rawElement.OrderUuid.S,
    OrderContent: rawElement.OrderContent.S,
    OrderReport: parsers.json(rawElement.OrderReport.S),
    CreatedAt: parsers.date(rawElement.CreatedAt.S),
    UpdatedAt: parsers.date(rawElement.UpdatedAt.S)
});

const clientsByTableName: { [key: string]: any } = {};

export class DynamoClient {
    private tableColumns: string[] = [];

    constructor(
        private tableName: string
    ) {
        if (this.tableName === DYNAMODB_TABLE_NAME) {
            this.tableColumns = DYNAMO_DB_COLUMNS;
        }
    }

    async update(orderUuid: string, newReport: any) {
        const params: DynamoDB.Types.UpdateItemInput = {
            TableName: this.tableName,
            Key: {
                "UserUuid": {S: "test-random-uuid-1234"},
                "OrderUuid": {S: orderUuid},
            },
            UpdateExpression: "set OrderReport = :report",
            ExpressionAttributeValues: {
                ":report": {S: JSON.stringify(newReport)}
            },
            ReturnValues: "UPDATED_NEW"
        };

        return new Promise((resolve, reject) => {
            myDynamo.updateItem(params, (err: any, data: any) => {
                if (err) {
                    console.log('error', err);
                    reject(data);
                } else {
                    // const elements = data.Items.map(parseElement);
                    console.log("found", data);
                    resolve(data);
                }
            });
        });
    }

    async scan(newReport: any) {
        console.log('update DynamoDb', newReport);

        const params: DynamoDB.Types.QueryInput = {
            ExpressionAttributeValues: {
                ":userUuid": {S: "test-random-uuid-1234"}
            },
            KeyConditionExpression: "UserUuid = :userUuid",
            ProjectionExpression: this.tableColumns.join(", "),
            TableName: this.tableName
        };

        return new Promise((resolve, reject) => {
            myDynamo.query(params, (err: any, data: any) => {
                if (err) {
                    console.log('error', err);
                    reject(data);
                } else {
                    const elements = data.Items.map(parseElement);
                    console.log("found", elements);
                    resolve(elements);
                }
            });
        });
    }
}
