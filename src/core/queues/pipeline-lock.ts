import { IDistributedLockProvider, IQueueProvider } from 'workflow-es';
import { RedisLockManager } from './redis-lock-manager';
import { RedisQueueProvider } from './redis-queue-provider';
// const workflow_redis = require("workflow-es-redis");
const Redis = require('ioredis');

const REDIS_LOCK_URL = 'redis://127.0.0.1:6379/4';

const redisConnection = new Redis(REDIS_LOCK_URL);

export const workflowLockLoader = async function(): Promise<IDistributedLockProvider> {
    // return new workflow_redis.RedisLockManager(redisConnection); => ko : "lock.renew is not a function"
    return new RedisLockManager(redisConnection);
};

export const workflowQueueLoader = async function(): Promise<IQueueProvider> {
    // return new workflow_redis.RedisQueueProvider(redisConnection);   => custom class for personal debugging
    return new RedisQueueProvider(redisConnection);
};
