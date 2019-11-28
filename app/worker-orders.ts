// something that will poll orders from sqs queue
import { Main } from '../src/main';
import { AwsSqsOrders } from './lib/aws/aws-sqs-orders';
import { Message } from 'aws-sdk/clients/sqs';
import { FakeDelay } from '@fake';
import { ModeLoader } from '../src/core/mode/cli-mode-loader';
import { wait } from '@utils';

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

    sqsClient.pollLoop((message:Message) => {
        console.log('message', message.Attributes && message.Attributes.SentTimestamp);
        console.log('fake delay');
        return Promise.all([
            wait(3000),
            sqsClient.deleteMessage(message),
            app.handleYMLOrder(message.Body || '')
        ]);
    });

    sqsClient.onOrder().subscribe(message => {
        console.log('message from subscription');
    });
};
