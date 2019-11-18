import * as AWS from 'aws-sdk';
import { Message } from 'aws-sdk/clients/sqs';
import { BehaviorSubject, ReplaySubject } from 'rxjs';

AWS.config.update({region: 'eu-central-1'});
const sqs = new AWS.SQS({apiVersion: '2012-11-05'});

export class AwsSqsOrders {
    private readonly queueURL: string;
    private pollSubject: ReplaySubject<Message> = new ReplaySubject<Message>();
    private loopPolling = false;

    constructor() {
        if (!process.env.AWS_SQS_ORDERS_QUEUE_URL) {
            throw new Error('process.env.AWS_SQS_ORDERS_QUEUE_URL must be set');
        }

        this.queueURL = process.env.AWS_SQS_ORDERS_QUEUE_URL;
    }

    push(order: string) {
        const params = {
            DelaySeconds: 10,
            MessageAttributes: {
                // "Author": {
                //     DataType: "String",
                //     StringValue: "John Grisham"
                // },
                // "WeeksOn": {
                //     DataType: "Number",
                //     StringValue: "6"
                // }
            },
            MessageBody: order,
            // MessageDeduplicationId: "TheWhistler",  // Required for FIFO queues
            // MessageId: "Group1",  // Required for FIFO queues
            QueueUrl: process.env.AWS_SQS_ORDERS_QUEUE_URL || ''
        };
        return new Promise((resolve, reject) => sqs.sendMessage(params, (err, data) => {
            if (err) {
                reject(err);
            } else {
                console.log("Success", data.MessageId);
                resolve(data.MessageId)
            }
        }));
    }

    poll(): Promise<Message | void> {
        // single poll request
        const params = {
            AttributeNames: [
                "SentTimestamp"
            ],
            MaxNumberOfMessages: 1,
            MessageAttributeNames: [
                "All"
            ],
            QueueUrl: this.queueURL,
            VisibilityTimeout: 20,
            WaitTimeSeconds: 20
        };

        return new Promise(((resolve, reject) => {
            sqs.receiveMessage(params, (err, data) => {
                if (err) {
                    reject(err);
                } else if (data.Messages && data.Messages.length) {
                    // this.deleteMessage(data.Messages[0])
                    resolve(data.Messages[0]);
                } else {
                    console.log('nothing');
                    resolve();
                }
            });
        }));
    }

    pollLoop(callback: (m:Message) => Promise<any>) {
        this.poll().then(message => {
            if (message) {
                callback(message).then(() => this.pollLoop(callback));
                this.pollSubject.next(message);
            } else {
                this.pollLoop(callback);
            }

        })
    }

    deleteMessage(message: Message) {
        if(!message.ReceiptHandle) {
            throw new Error('Missing message.ReceiptHandle')
        }

        const deleteParams = {
            QueueUrl: this.queueURL,
            ReceiptHandle: message.ReceiptHandle
        };
        sqs.deleteMessage(deleteParams, function (err, data) {
            if (err) {
                console.log("Delete Error", err);
            } else {
                console.log("Message Deleted", data);
            }
        });
    }

    onOrder() {
        return this.pollSubject.asObservable();
    }
}
