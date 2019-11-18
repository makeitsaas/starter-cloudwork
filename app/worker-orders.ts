// something that will poll orders from sqs queue
import { Main } from '../src/main';
import { AwsSqsOrders } from './lib/aws/aws-sqs-orders';

const app = new Main();
const sqsClient = new AwsSqsOrders();

app.ready.then(() => {
    return workerHandler();
}).catch(err => {
    console.log('----- error catch end');
    console.log(err);
    app.exit();
});


const workerHandler = () => {
    console.log('process.env.AWS_SQS_ORDERS_QUEUE_URL', process.env.AWS_SQS_ORDERS_QUEUE_URL);

    sqsClient.onOrder().subscribe(message => {
        console.log('message', message);
    });
};
