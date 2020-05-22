import { injectable, inject } from "inversify";
import { IDistributedLockProvider, TYPES, ILogger } from 'workflow-es';
import * as RedLock from 'redlock';
import * as IORedis from 'ioredis';
import { Lock } from 'redlock';

@injectable()
export class RedisLockManager implements IDistributedLockProvider {

    private leaseDuration: number = 60;
    private leases: Map<string, Lock> = new Map<string, Lock>();
    private renewTimer: any;
    private redis: IORedis.Redis;
    private redlock: RedLock;

    constructor(connection: IORedis.Redis) {
        this.redis = connection;
        this.redlock = new RedLock([connection]);
        this.renewTimer = setInterval(this.renewLeases, 45000, this);
    }

    public async aquireLock(id: string): Promise<boolean> {
        try {
            let lock: Lock = await this.redlock.lock(id, this.leaseDuration * 1000);
            this.leases.set(id, lock);
            return true;
        }
        catch {
            return false;
        }
    }

    public async releaseLock(id: string): Promise<void> {
        let lock = this.leases.get(id);
        if (lock) {
            lock.unlock();
            this.leases.delete(id);
        }
    }

    private renewLeases(self: RedisLockManager) {
        self.leases.forEach((lock) => {
            // lock.renew(self.leaseDuration * 1000);
            lock.extend(self.leaseDuration * 1000);
        });
    }
}
