// something that will poll orders from sqs queue
import { Main } from '../src/main';
import { AwsSqsOrders } from './lib/aws/aws-sqs-orders';
import { Message } from 'aws-sdk/clients/sqs';
import { FakeDelay } from '@fake';
import { ModeLoader } from '../src/core/mode/cli-mode-loader';
import { wait } from '@utils';
import { AwsSqsOrderInterface } from './lib/aws/aws-sqs-order-interface';

const app = new Main();
const sqsClient = new AwsSqsOrders();

ModeLoader();

app.ready.then(() => {
    return workerHandler();
}).catch(err => {
    console.log('----- error catch end');
    console.log(err);
    app.exit();
    throw err;
});

const workerHandler = () => {
    console.log('process.env.AWS_SQS_ORDERS_QUEUE_URL', process.env.AWS_SQS_ORDERS_QUEUE_URL);

    sqsClient.pollLoop((message: Message) => {
        console.log('message', message.Attributes && message.Attributes.SentTimestamp);
        console.log('body', message.Body);
        const {UserUuid, OrderUuid, OrderContent} = parseBody(message.Body);
        return Promise.all([
            wait(3000),
            sqsClient.deleteMessage(message),
            app.handleYMLOrder(OrderUuid, UserUuid, OrderContent)  // todo : Body shall contain both OrderUuid and OrderContent
        ]);
    });

    sqsClient.onOrder().subscribe(message => {
        console.log('message from subscription');
    });
};

const parseBody = (messageBody?: string): AwsSqsOrderInterface => {
    if (!messageBody) {
        throw new Error("Invalid message.Body (empty)");
    }

    let parsedBody: any;

    try {
        parsedBody = JSON.parse(messageBody);
    } catch (e) {
        throw new Error("Invalid message.Body (invalid JSON)");
    }

    const UserUuid = parsedBody.UserUuid;
    const OrderUuid = parsedBody.OrderUuid;
    const OrderContent = parsedBody.OrderContent;

    if (typeof UserUuid !== "string") {
        throw new Error("Invalid User uuid");
    }

    if (typeof OrderUuid !== "string") {
        throw new Error("Invalid User uuid");
    }

    if (typeof OrderContent !== "string") {
        throw new Error("Invalid User uuid");
    }

    return {UserUuid, OrderUuid, OrderContent}
};
