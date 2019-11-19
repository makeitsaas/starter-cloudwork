import { injectable, inject } from "inversify";
import * as IORedis from 'ioredis';
import { IQueueProvider, QueueType } from "workflow-es";

@injectable()
export class RedisQueueProvider implements IQueueProvider {

    private workflowQueue: string = 'wes-workflow-queue';
    private eventQueue: string = 'wes-event-queue';
    private redis: IORedis.Redis

    constructor(connection: IORedis.Redis) {
        this.redis = connection;
    }

    public async queueForProcessing(id: string, queue: any): Promise<void> {
        console.log('queueForProcessing', id, queue);
        this.redis.lpush(this.getQueueName(queue), id);
    }

    public async dequeueForProcessing(queue: any): Promise<string> {
        const id = await this.redis.rpop(this.getQueueName(queue));
        if (id) {
            console.log('queueForProcessing', queue, id);
        }
        return id;
    }

    private getQueueName(queue: any): string {
        let queueName = '';
        switch (queue) {
            case QueueType.Workflow:
                queueName = this.workflowQueue;
                break;
            case QueueType.Event:
                queueName = this.eventQueue;
                break;
        }
        return queueName;
    }
}
